# Tevis Engineering Solutions — Public Website

Static HTML/CSS/JS site hosted on GitHub Pages at [tevis-engineering-solutions.github.io](https://tevis-engineering-solutions.github.io). This is the public-facing marketing and client intake site for Tevis Engineering Solutions, a veteran-owned IT support and engineering services firm based in Cleveland, Ohio.

The site handles: service marketing, pricing display, client ticket submission (behind a portal login), invoice lookup and payment, and legal/policy disclosure.

**Pages:** `index.html` · `make_ticket.html` · `pay_invoice.html` · `pricing_sheet.html` · `how_support_works.html` · `data_destruction.html` · `knowledge_transfer.html` · `website_creation.html` · `privacy_policy.html`

**Deployments:** Every push to `main` deploys immediately — no CI, no build step.

See `CLAUDE.md` for full design system documentation, form endpoints, business contact info, and code conventions.

---

## Suggested Features & Professional Improvements

These are concrete recommendations for what a polished startup IT company site should have. They're organized roughly from highest business impact to nice-to-have.

### 1. Real Logo and Brand Assets
Every page currently shows a blank white square. A real logo — even a simple text mark or SVG — is the single most impactful visual fix. Pair it with a `favicon.ico` (currently missing on all pages). Consider adding an `apple-touch-icon` and a basic `site.webmanifest` for completeness.

### 2. Custom Domain
The site URL is `tevis-engineering-solutions.github.io`. Switching to `tevisengineering.com` (or similar) would dramatically increase perceived professionalism. GitHub Pages supports custom domains natively. The pricing sheet already lists the GitHub subdomain as the business URL — this should be updated as soon as a domain is acquired.

### 3. Open Graph + Social Sharing Meta Tags
Currently zero OG tags exist. Any time a link to this site is shared on LinkedIn, Slack, or iMessage, it shows a blank preview. For a professional services firm where LinkedIn is a key acquisition channel, this is high priority. Every page needs `og:title`, `og:description`, `og:image`, and `og:url` at minimum.

### 4. Unified Site Navigation
The site has three different navigation patterns across nine pages and no way to get from a detail page (e.g., `data_destruction.html`) to any other page except via "Home." A simple sticky topbar with consistent links to the main service sections, client portal, and contact would make the site feel coherent and keep visitors engaged longer.

### 5. Calendar Booking Embed
The index.html contact section has a "Book Your Free Consultation" link pointing to a Proton Calendar booking URL. This is the right instinct, but having it only as a secondary CTA below the contact form buries it. A live calendar widget embedded prominently on the homepage and on service detail pages would convert better. Calendly, Cal.com, and Proton Calendar all support embeds. Consider making booking the primary CTA.

### 6. Real Testimonials with Social Proof
The three testimonials currently on the homepage ("Sarah M., Small Business Owner," "Michael R., Cleveland," "David K., Local Contractor") are very generic and look like placeholders. Professional testimonials should include full name, company name (or "Personal Client"), and if possible a photo or LinkedIn profile link. A Google Reviews embed or a Trustpilot badge would add third-party credibility that anonymous quotes cannot provide.

### 7. Case Studies / Portfolio Section
The website creation and engineering pages describe capabilities but show no examples of real work. Even brief anonymized case studies ("Deployed 12 workstations for a 6-person legal office — completed in 2 days, zero downtime") demonstrate capability far more convincingly than bullet lists. A dedicated "Work" or "Results" page would serve both SEO and sales purposes.

### 8. Live Chat or Tawk.to Widget
A live chat widget (Tawk.to is free) would let a prospect ask a quick question without committing to a form submission or phone call. For a one-person operation this could be set to "offline/email" when unavailable. Even a chat that collects name + question and emails it to Tyler would convert better than forcing every prospect through a full form.

### 9. Service Status / Uptime Page
If TES ever takes on monthly managed clients, a simple service status page (even a hand-maintained one or a free Statuspage.io instance) signals operational maturity. Clients paying $1,560/month want to know there's a reliable escalation path.

### 10. Blog / Knowledge Base
A "Tips" or "Knowledge Base" section with even 5–10 articles on common SMB IT topics (e.g., "How to tell if your PC needs a RAM upgrade," "What to do before calling IT support") would drive organic search traffic, establish expertise, and provide shareable content for LinkedIn. GitHub Pages can host Markdown-rendered content with a lightweight static site generator (Jekyll is built-in) or simple HTML article pages.

### 11. Proper 404 Page
GitHub Pages serves its own generic 404 for broken links. A branded `404.html` with navigation back to the homepage and a contact prompt is a simple fix that prevents dead-end experiences.

### 12. sitemap.xml and robots.txt
A `sitemap.xml` helps search engines discover all 9 pages. A `robots.txt` gives basic crawl guidance (even just `Allow: /`). Both take under 10 minutes to create and have no downside.

### 13. Schema.org Structured Data
Adding `LocalBusiness` or `ProfessionalService` JSON-LD to `index.html` improves how Google displays the site in search results (Knowledge Graph, rich snippets for phone/address, review stars). This is especially valuable for local "IT support Cleveland" searches.

### 14. Email Address Standardization
Multiple pages reference `tyler.m.tevis@gmail.com` (a personal Gmail). All public-facing contact references should use the professional `@tevisengineering.com` domain for consistency and credibility.

### 15. Accept More Payment Methods / Streamline Payment Flow
The `pay_invoice.html` currently uses a legacy PayPal NVP form (`cgi-bin/webscr` endpoint) to submit payments. PayPal's newer Smart Payment Buttons or PayPal.Me links are simpler to implement and more reliable. The `PAYPAL_LINK` constant defined in the JS is never used — it should either replace the NVP form or be removed.

---

## Known Issues & Bugs to Fix

These were found by reading all 9 HTML files. Organized by priority. ✅ = resolved on 2026-06-10.

---

### 🔴 HIGH PRIORITY

**H1 — Client Portal Login Is Not Secure (make_ticket.html)** ✅ RESOLVED
~~The login gate fetches username/password pairs from a Google Apps Script URL and does a client-side comparison in the browser.~~ Removed the login gate entirely. The ticket form is now publicly accessible. A comment block in the HTML explains the issue and lists real auth options (Cloudflare Access, Supabase, Firebase) for a future migration.

**H2 — No Logo on Any Page** ✅ RESOLVED
~~Every page has a blank white square.~~ All 9 pages now display a TES monogram (gradient blue→teal, dark text) in the logo slot. The placeholder comment remains so the span can be swapped for a real `<img>` with one line of HTML per page.

**H3 — Hero Background Image on Imgur (index.html)** ✅ RESOLVED
~~The homepage hero uses an imgur-hosted image that Imgur may block.~~ Replaced with a CSS radial-gradient fallback. A `TODO` comment marks the exact line where a self-hosted `assets/hero-bg.jpg` should be dropped in.

**H4 — No Open Graph Meta Tags Site-Wide** ✅ RESOLVED
All 9 pages now have a complete OG block: `og:type`, `og:url`, `og:title`, `og:description`, `og:image`. LinkedIn previews will populate when `assets/og-image.png` is uploaded.

**H5 — Missing Favicon** ✅ RESOLVED
Created `favicon.svg` (TES monogram, gradient background, rounded corners). All 9 pages link to it via `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`.

**H6 — Late Fee Terms Contradicted Between Pages** ✅ RESOLVED
`index.html` Service Agreement Highlights now reads: "1.5% monthly finance charge (18% APR). Service suspended at 14+ days past due without prior arrangement." — matching `privacy_policy.html` section 3.5 (the governing document).

**H7 — Personal Gmail Used in Privacy Policy and Payment Terms** ✅ RESOLVED
`privacy_policy.html` section 1.6 now uses `tyler@tevisengineering.com`; section 3.6 now uses `billing@tevisengineering.com`. Personal Gmail address removed from all public-facing pages.

**H8 — Both Contact Form and Ticket Form Use the Same Formspree Endpoint** ⚠️ INTENTIONALLY DEFERRED
Both forms intentionally share endpoint `maqvanal`. The free Formspree tier allows only two endpoints total; both are already in use (maqvanal for contact/ticket, mzdoowdj for billing). The back-end scripts `sync-formspree.js` / `formspree-parser.js` already distinguish email type from submission content. Upgrade to a paid Formspree tier (or switch to a self-hosted forwarder) if separate routing is needed.

---

### 🟡 MEDIUM PRIORITY

**M1 — No Consistent Cross-Page Navigation** ✅ RESOLVED
All four Theme C detail pages (`how_support_works`, `data_destruction`, `knowledge_transfer`, `website_creation`) now include nav links to: Home, How Support Works, Submit Ticket, Pay Invoice, Pricing Sheet, Contact. Each also has a hamburger toggle for mobile. Theme B utility pages retain the minimal "Return Home" nav appropriate to their portal context.

**M2 — "Login" Button Label Is Misleading (index.html)** ✅ RESOLVED
Renamed from "Login" to "Client Portal" in the homepage nav.

**M3 — Contact Form Has No `<label>` Elements (index.html)** ✅ RESOLVED
All four contact form fields (Name, Email, Phone, Message) now have associated `<label>` elements with `for`/`id` pairs and matching CSS styling.

**M4 — Billing Support Form Has No `<label>` Elements (pay_invoice.html)** ✅ RESOLVED
All seven billing support form fields now have associated `<label>` elements.

**M5 — Invoice Query Input Has No Placeholder Text (pay_invoice.html)** ✅ RESOLVED
Placeholder now reads: `"e.g. TES-2026-001 or your admin username"`.

**M6 — PayPal Legacy NVP Endpoint + Unused PAYPAL_LINK Constant (pay_invoice.html)** ✅ RESOLVED (partial)
Dead `PAYPAL_LINK` constant removed. The legacy NVP endpoint (`cgi-bin/webscr`) remains — PayPal has not yet formally deprecated it and it is the only self-hosted approach that doesn't require a server component. A comment explains the tradeoff and links the modern PayPal.me URL.

**M7 — Billing Support Form Missing `_next` Redirect (pay_invoice.html)** ✅ RESOLVED
Added `<input type="hidden" name="_next" value="...?billing_submitted=1">`. On successful submission, a branded success card is shown and the form is hidden.

**M8 — No 404 Page** ✅ RESOLVED
Created `404.html` with TES branding (Theme B), navigation buttons, and `<meta name="robots" content="noindex">`.

**M9 — No sitemap.xml** ✅ RESOLVED
Created `sitemap.xml` with all 9 pages, `lastmod` dates, and appropriate priority values.

**M10 — No robots.txt** ✅ RESOLVED
Created `robots.txt` with `Allow: /` and sitemap reference.

**M11 — Footer Inconsistency — Most Interior Pages Have No Links** ✅ RESOLVED
All four Theme C detail pages now have footers with: Home, Submit a Ticket, Pay Invoice, LinkedIn links.

**M12 — Phone Area Code (814) vs "Cleveland-Based" Positioning** ✅ RESOLVED
Added a parenthetical note in index.html where the phone number appears: "(Erie-area number — serving Cleveland)".

**M13 — Testimonials Appear Generic / Placeholder** ⚠️ OPEN
Still needs real testimonials with full attribution. Placeholder names remain until Tyler can provide actual client quotes. Remove or replace before actively promoting the site.

---

### 🟢 LOW PRIORITY

**L1 — Missing Canonical Link Tags** ✅ RESOLVED
All 9 pages now include `<link rel="canonical">`.

**L2 — Missing Twitter/X Card Meta Tags** ✅ RESOLVED
All 9 pages now include Twitter card meta tags (`summary_large_image`).

**L3 — No Schema.org Structured Data** ✅ RESOLVED
Added `LocalBusiness` + `ProfessionalService` JSON-LD to `index.html`.

**L4 — Animation Bug: Cards Start Invisible on Page Load (index.html)** ✅ RESOLVED
Changed HTML classes from `animate-on-scroll` (applied at parse time) to `will-animate` (invisible placeholder). IntersectionObserver adds `animate-on-scroll` and then `unobserve()`s so the animation fires exactly once on scroll entry.

**L5 — Privacy Policy "Last Updated" Date Is Stale** ✅ RESOLVED
Updated to "June 2026".

**L6 — pricing_sheet.html Lists GitHub Pages URL as Business Website** ⚠️ OPEN
Still shows `tevis-engineering-solutions.github.io`. Update when a real domain is acquired.

**L7 — pricing_sheet.html Missing `<meta name="description">`** ✅ RESOLVED
Added description, author, OG, Twitter, canonical, and favicon meta to `pricing_sheet.html`.

**L8 — Social Footer Links Have No rel="noopener noreferrer" on All Pages** ✅ RESOLVED
`rel="noopener noreferrer"` added to LinkedIn and GitHub links on `index.html` and all footer nav links on detail pages.

**L9 — No `<meta name="author">` Tags** ✅ RESOLVED
Added `<meta name="author" content="Tyler Tevis, Tevis Engineering Solutions">` to all 9 pages.

**L10 — how_support_works.html Mobile Nav Stacks Without Hamburger** ✅ RESOLVED
Added hamburger `#navToggle` button with CSS toggle and `addEventListener` JS block to `how_support_works.html` (and equivalently to all other detail pages that received nav updates).

**L11 — Testimonial Quote Has Typo (index.html)** ✅ RESOLVED
Fixed "deparments" → "departments".

**L12 — Crypto Payment Card on pay_invoice.html** ✅ RESOLVED
Removed the BTC/Proton Wallet payment section, its CSS rules, and associated grid column. Page now shows a cleaner 2-column layout: invoice lookup + billing support form.

**L13 — No .gitignore** ✅ RESOLVED
Created `.gitignore` excluding `CLAUDE.md`, `.env*`, `*.log`, `node_modules/`, `.DS_Store`, `Thumbs.db`, and editor metadata directories.

---

## Privacy & Security Action Items

Full audit of all HTML files conducted on 2026-06-11. Findings are prioritized HIGH / MEDIUM / LOW.

---

### 🔴 HIGH

**S1 — Personal Gmail in PayPal NVP Form (`pay_invoice.html`)**
The hidden PayPal form at `id="paypalForm"` passes `tyler.m.tevis@gmail.com` as the `business` field. This means every client who completes a PayPal payment sees your personal Gmail in the PayPal checkout flow — not the business identity. The PayPal account itself may also be a personal account.
Fix (in-HTML): Update the `name="business"` hidden input value to match the professional PayPal account email. Long-term: migrate to PayPal's hosted Smart Payment Buttons or PayPal.me link, which don't expose account email in client-side HTML.

**S2 — `make_ticket.html` Form Missing Honeypot Spam Trap**
The contact form on `index.html` and the billing form on `pay_invoice.html` both include `<input type="text" name="_honeypot" style="display:none;">` for bot filtering. The ticket form on `make_ticket.html` does not. All Formspree forms should have this field.
Fix (in-HTML): Add `<input type="text" name="_honeypot" style="display:none;" tabindex="-1" autocomplete="off">` inside the `#ticketForm` form element.

---

### 🟡 MEDIUM

**S3 — Google Fonts Leaks Visitor IP to Google (all 9 pages)**
Every page loads `https://fonts.googleapis.com/css2?family=Inter...` on render. This is a live request to Google's servers that includes the visitor's IP address, user agent, and referring URL. Under GDPR, this constitutes data transfer to a third party. German and Austrian courts have ruled this a violation without explicit consent. Under CCPA, disclosure is required.
Fix: Self-host Inter and Montserrat. Download from `fontsource.org` or `google-webfonts-helper.herokuapp.com`, place in `assets/fonts/`, and replace `<link>` tags with `@font-face` declarations. No CDN request, no IP leak. Alternatively, proxy fonts through Cloudflare Workers.

**S4 — Font Awesome CDN (cdnjs.cloudflare.com) Leaks Visitor IP (all 9 pages)**
Same pattern as S3. Cloudflare's CDN receives a request on every page load. Lower regulatory risk than Google (Cloudflare is widely used infrastructure), but still a third-party IP log.
Fix (requires external service): Route all requests through Cloudflare's own CDN/proxy. The Font Awesome file could also be downloaded and self-hosted in `assets/vendor/`.

**S5 — Security Headers Cannot Be Set on GitHub Pages**
GitHub Pages does not allow custom HTTP response headers. The following headers are important for defense in depth and cannot be set without a CDN or reverse proxy layer:
- `Content-Security-Policy` (CSP) — prevents XSS by restricting script/style sources
- `X-Frame-Options: DENY` — prevents clickjacking via `<iframe>` embeds
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Strict-Transport-Security` (HSTS) — forces HTTPS
- `Referrer-Policy: strict-origin-when-cross-origin` — limits referrer data sent to third parties
Fix (requires external service): Add Cloudflare (free tier) in front of the GitHub Pages origin and configure these headers in Cloudflare's Transform Rules or a Worker. This is the recommended path when the custom domain is acquired.

**S6 — `innerHTML` Assignment with API-Sourced Data (`pay_invoice.html`)**
In `renderResult()`, the Pay Invoice button's label is set via `payInvoiceBtn.innerHTML = "Pay Invoice (" + displayAmountForButton + ") ..."`. The `displayAmountForButton` value comes from the Google Apps Script API response. If that API endpoint were ever compromised or returned unexpected data, this could result in HTML injection.
Fix (in-HTML): Use `payInvoiceBtn.textContent` for the text portion and append the icon element separately with `document.createElement`. Since the API is self-controlled and the value is a dollar amount, actual risk is low but the fix is trivial.

**S7 — PayPal Legacy NVP Endpoint (`pay_invoice.html`)**
The hidden PayPal form submits to `https://www.paypal.com/cgi-bin/webscr` (Payments Standard NVP API, circa 2005). PayPal has not deprecated it but it receives no new features and is not recommended for new implementations. The amount, business email, and invoice reference are all visible in client-side HTML.
Fix: Migrate to PayPal's JS SDK (hosted Smart Buttons) or the PayPal.me link (`https://www.paypal.com/ncp/payment/HKB3W4JJ92MH8`). The SDK approach hides the business email from client HTML.

**S8 — Google Apps Script Invoice API URL Exposed Client-Side (`pay_invoice.html`)**
The full Google Apps Script deployment URL (`script.google.com/macros/s/...`) is hard-coded in the page's JavaScript. This URL is functionally public (anyone with it can read invoice data). Because it's a GET endpoint returning public billing summaries, this is acceptable — but the intent should be documented and the Apps Script should have:
- Execution set to "Anyone" (anonymous read) with no edit permissions
- No sensitive fields (full addresses, SSNs, etc.) in the invoice sheet
Fix: Verify Google Apps Script deployment permissions are read-only. Add a comment in the HTML confirming this is an intentionally public endpoint.

---

### 🟢 LOW

**S9 — Inline Event Handlers on New Elements (`pricing_sheet.html`, `make_ticket.html`)**
`pricing_sheet.html` has `onclick="window.print()"` on the print button. `make_ticket.html` has `onsubmit="handleSubmit(event)"` on the form. Both work but violate the code convention ("No `onclick=""` on new elements") and would be blocked by a strict `script-src` CSP if one were added in the future.
Fix (in-HTML): Move both to `addEventListener` calls in the `<script>` blocks.

**S10 — Venmo Username Exposed in HTML (`index.html`, `pay_invoice.html`)**
The Venmo link `https://account.venmo.com/u/tyler-teee` exposes the owner's Venmo username in source-visible HTML. For a business, this links the company's payment page to a personal Venmo profile. No security risk per se, but a privacy consideration.
Fix: When a business Venmo account is created, update to that handle. Or remove Venmo from public pages and collect it only via direct client communication.

**S11 — No `rel="noopener"` on `formspree.io` and `paypal.com` Policy Links (`privacy_policy.html`)**
Two `<a target="_blank">` links in `privacy_policy.html` (to Formspree and PayPal privacy policies) use `rel="noopener"` but not `rel="noreferrer"`. While `noopener` closes the window.opener security hole, `noreferrer` additionally prevents the Referer header from leaking the TES page URL to Formspree/PayPal.
Fix (in-HTML): Change `rel="noopener"` to `rel="noopener noreferrer"` on those two links.

**S12 — `og:image` and `twitter:image` Point to Non-Existent Asset (all 9 pages)**
All pages reference `assets/og-image.png` in OG/Twitter image meta tags, but this file doesn't exist. When shared on social platforms, a broken image is requested and logged to Google/CDN servers. No security risk, but a privacy-adjacent audit note.
Fix: Create `assets/og-image.png` (1200×630px). Until then, either remove the image meta tags or point to a placeholder.

**S13 — GitHub Pages May Set Analytics/Performance Cookies**
`privacy_policy.html` accurately states "We do not use tracking cookies beyond what GitHub Pages may set by default." GitHub Pages does not currently set cookies, but this is subject to change without notice. If migrating to Cloudflare, verify Cloudflare's cookie behavior and update the policy accordingly.
Fix: No action required now. Revisit when custom domain and CDN are in place.
