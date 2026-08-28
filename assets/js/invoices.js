/* ---------------------------------------------------------------------------
   TES invoicing client  —  assets/js/invoices.js
   Shared by pay_invoice.html (public lookup) and portal/billing.html (portal).

   Data source: the Google Apps Script web app in front of the billing sheet.
   The script is called two ways:

     ?q=<token>      one-off lookup by invoice number OR account/username
     ?email=<addr>   every invoice billed to one email address

   Both calls also filter client-side after the response, so this file keeps
   working against the older Apps Script deployment that ignores the query
   string and returns the whole sheet. See _ops/INVOICING.md.
--------------------------------------------------------------------------- */
(function (global) {
  'use strict';

  var API_URL = 'https://script.google.com/macros/s/AKfycbzOqk9rjdEQ12A8m5VXIFbEWd-V79YA9J9Av_Zb_Qe478KR0QjXTcsdC3AwoyrlwFM4/exec';

  /* Column aliases. The sheet's header row supplies the JSON keys, so accept
     the names in use today plus the ones a future sheet is likely to use. */
  var FIELDS = {
    email:       ['Email', 'ClientEmail', 'Account', 'AccountEmail', 'Username', 'Client'],
    number:      ['InvoiceNumber', 'Invoice', 'InvoiceID', 'LatestInvoice', 'Number'],
    service:     ['ServiceType', 'Service', 'Type', 'Cadence'],
    amount:      ['InvoiceAmount', 'Amount', 'Total', 'Balance', 'AmountDue'],
    paid:        ['Paid', 'Status', 'PaidStatus'],
    issued:      ['IssuedDate', 'Issued', 'InvoiceDate', 'Date'],
    due:         ['DueDate', 'Due'],
    description: ['Description', 'Details', 'Notes', 'Note', 'Memo', 'LineItems'],
    paidDate:    ['PaidDate', 'DatePaid', 'PaymentDate'],
    ref:         ['PaymentRef', 'PaymentReference', 'OrderID', 'PayPalOrder']
  };

  function pick(row, keys) {
    for (var i = 0; i < keys.length; i++) {
      if (Object.prototype.hasOwnProperty.call(row, keys[i])) {
        var v = row[keys[i]];
        if (v !== '' && v !== null && v !== undefined) return v;
      }
    }
    return '';
  }

  function normalizeToken(value) {
    return String(value == null ? '' : value).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function toNumber(value) {
    if (typeof value === 'number') return isFinite(value) ? value : null;
    var n = Number(String(value == null ? '' : value).replace(/[^0-9.\-]/g, ''));
    return isFinite(n) ? n : null;
  }

  function formatUSD(value) {
    var n = typeof value === 'number' ? value : toNumber(value);
    if (n === null) return String(value || '—');
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  function dateValue(value) {
    if (!value) return null;
    if (value instanceof Date) return value.getTime();
    var s = String(value).trim();
    // Bare YYYY-MM-DD is parsed as UTC by Date, which can render as the day
    // before in US time zones. Pin it to local noon instead.
    var ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (ymd) return new Date(+ymd[1], +ymd[2] - 1, +ymd[3], 12).getTime();
    var t = Date.parse(s);
    return isNaN(t) ? null : t;
  }

  function formatDate(value) {
    var t = dateValue(value);
    if (t === null) return String(value || '—');
    return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function isPaidFlag(value) {
    var s = String(value == null ? '' : value).trim().toLowerCase();
    if (!s) return false;
    return /^(y|yes|true|t|1|paid|complete|completed|settled|closed)/.test(s);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Turn one raw sheet row into the shape the pages render. */
  function parseRow(row) {
    var emailRaw = String(pick(row, FIELDS.email) || '').trim();
    return {
      email:       emailRaw,
      emailKey:    emailRaw.toLowerCase(),
      number:      String(pick(row, FIELDS.number) || '').trim(),
      service:     String(pick(row, FIELDS.service) || '').trim(),
      amount:      toNumber(pick(row, FIELDS.amount)),
      paid:        isPaidFlag(pick(row, FIELDS.paid)),
      issued:      pick(row, FIELDS.issued),
      due:         pick(row, FIELDS.due),
      description: String(pick(row, FIELDS.description) || '').trim(),
      paidDate:    pick(row, FIELDS.paidDate),
      ref:         String(pick(row, FIELDS.ref) || '').trim(),
      raw:         row
    };
  }

  function isOverdue(inv) {
    if (inv.paid) return false;
    var t = dateValue(inv.due);
    return t !== null && t < Date.now();
  }

  /* ---------- network ---------------------------------------------------- */

  /* The Apps Script deployment is erratic: identical back-to-back calls have
     returned 200 in 2.2s, then 404 at 34s, then 404 at 66s, then 200 in 2.2s.
     A healthy instance answers in about two seconds, so cut a hung request off
     early and retry — the retry usually lands on a good instance. Without this
     the page sits on a spinner for a minute and then gives up. */
  var REQUEST_TIMEOUT_MS = 12000;
  var RETRIES = 2;

  function fetchOnce(url, timeoutMs) {
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, timeoutMs);
    var opts = { cache: 'no-store' };
    if (ctrl) opts.signal = ctrl.signal;

    return fetch(url, opts).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error('Invoice API returned ' + res.status);
      return res.json();
    }, function (err) {
      clearTimeout(timer);
      throw err;
    });
  }

  function fetchRows(params, opts) {
    opts = opts || {};
    var timeoutMs = opts.timeoutMs || REQUEST_TIMEOUT_MS;
    var attemptsLeft = opts.retries == null ? RETRIES : opts.retries;

    var qs = Object.keys(params || {}).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }).join('&');
    var url = API_URL + (qs ? '?' + qs : '');

    function attempt(remaining) {
      return fetchOnce(url, timeoutMs).catch(function (err) {
        if (remaining <= 0) throw err;
        return attempt(remaining - 1);
      });
    }

    return attempt(attemptsLeft).then(function (data) {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.rows)) return data.rows;
      if (data && Array.isArray(data.invoices)) return data.invoices;
      if (data && data.error) throw new Error(String(data.error));
      throw new Error('Unexpected invoice API response.');
    });
  }

  /* Every invoice billed to one email. The client-side filter is what makes
     this safe against an Apps Script deployment that still dumps the sheet. */
  function fetchForEmail(email) {
    var key = String(email || '').trim().toLowerCase();
    if (!key) return Promise.resolve([]);
    return fetchRows({ email: key }).then(function (rows) {
      return rows.map(parseRow).filter(function (inv) {
        return inv.emailKey && inv.emailKey === key;
      });
    });
  }

  /* One-off lookup by invoice number or account/username, for the public page. */
  function lookup(query) {
    var raw = String(query || '').trim();
    if (!raw) return Promise.resolve([]);
    var exact = raw.toLowerCase();
    var token = normalizeToken(raw);
    return fetchRows({ q: raw }).then(function (rows) {
      return rows.map(parseRow).filter(function (inv) {
        if (inv.emailKey === exact) return true;
        if (inv.number && inv.number.toLowerCase() === exact) return true;
        if (token && normalizeToken(inv.number) === token) return true;
        if (token && normalizeToken(inv.email) === token) return true;
        return false;
      });
    });
  }

  /* Tell the Apps Script an invoice was captured so it can mark the row paid.
     Fire-and-forget on purpose: if the write-back is not deployed yet, the
     payment still succeeded and the page falls back to its local pending
     badge. No custom headers, so the browser skips the CORS preflight that
     Apps Script cannot answer. */
  function notifyPaid(inv, orderId) {
    try {
      fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'markPaid',
          invoice: inv.number,
          email: inv.email,
          amount: inv.amount,
          orderID: orderId
        }),
        keepalive: true
      }).catch(function () {});
    } catch (e) { /* ignore — pending badge covers it */ }
  }

  /* ---------- identity --------------------------------------------------- */

  /* The portal Worker exposes the signed-in user at /portal-api/me, backed by
     the app-level session cookie. Local dev has no Worker, so ?as=<email> stands
     in for it. The hostname guard below means that branch is unreachable in
     production -- it cannot be used to impersonate anyone on the live site. */
  function getIdentity() {
    var host = location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '') {
      var as = new URLSearchParams(location.search).get('as');
      if (as) return Promise.resolve({ email: as, name: as.split('@')[0] });
    }
    // Identity is served by the portal Worker's app-level session, not by
    // Cloudflare Access. Shape is kept identical ({email, name}) so callers
    // did not have to change.
    return fetch('/portal-api/me', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { return d && d.ok ? d : null; })
      .catch(function () { return null; });
  }

  /* ---------- PayPal ----------------------------------------------------- */

  function whenPayPalReady(cb, onFail) {
    if (global.paypal && global.paypal.Buttons) { cb(); return; }
    var waited = 0;
    var timer = setInterval(function () {
      if (global.paypal && global.paypal.Buttons) { clearInterval(timer); cb(); return; }
      waited += 150;
      if (waited >= 9000) { clearInterval(timer); if (onFail) onFail(); }
    }, 150);
  }

  /* Render Smart Payment Buttons for one invoice into `container`.
     handlers: { onPaid(orderId, payerFirstName), onError(err) } */
  function mountPayPal(container, inv, handlers) {
    handlers = handlers || {};
    container.innerHTML = '';

    whenPayPalReady(function () {
      global.paypal.Buttons({
        style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay', height: 45 },
        createOrder: function (data, actions) {
          return actions.order.create({
            purchase_units: [{
              amount: { value: Number(inv.amount).toFixed(2), currency_code: 'USD' },
              description: ('Invoice ' + (inv.number || '') + ' — Tevis Engineering Solutions').slice(0, 127),
              custom_id: String(inv.number || '').slice(0, 127)
            }]
          });
        },
        onApprove: function (data, actions) {
          return actions.order.capture().then(function (details) {
            notifyPaid(inv, data.orderID);
            var first = '';
            try { first = details.payer.name.given_name || ''; } catch (e) {}
            if (handlers.onPaid) handlers.onPaid(data.orderID, first);
          });
        },
        onError: function (err) {
          console.error('PayPal error:', err);
          if (handlers.onError) handlers.onError(err);
        },
        onCancel: function () { /* buttons stay mounted */ }
      }).render(container);
    }, function () {
      if (handlers.onError) handlers.onError(new Error('PayPal SDK did not load.'));
    });
  }

  global.TESInvoices = {
    API_URL: API_URL,
    normalizeToken: normalizeToken,
    toNumber: toNumber,
    formatUSD: formatUSD,
    formatDate: formatDate,
    dateValue: dateValue,
    escapeHtml: escapeHtml,
    parseRow: parseRow,
    isOverdue: isOverdue,
    fetchRows: fetchRows,
    fetchForEmail: fetchForEmail,
    lookup: lookup,
    notifyPaid: notifyPaid,
    getIdentity: getIdentity,
    mountPayPal: mountPayPal
  };
})(window);
