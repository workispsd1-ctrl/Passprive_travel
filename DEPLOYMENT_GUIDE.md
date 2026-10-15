# PassPrivé Travel — Complete Deployment & Developer Handover Guide

> **Version:** 4.0.0 (Next.js + TypeScript + Tailwind CSS)  
> **Destination:** Mauritius Luxury & Curated Journeys  
> **WhatsApp Hotline:** `+91 78382 15147` (`917838215147`)  
> **Admin Login:** `admin@passprive.travel` | `PassPrive@2026#Admin`

---

## 1. Quick Start

The site is a Next.js 16 (App Router) application. Frontend pages and the backend API (formerly PHP) run in one Node.js process.

**Requirements:** Node.js 20.9+ and npm.

```bash
npm install
cp .env.example .env.local   # then fill in the RateHawk credentials
npm run dev                  # http://localhost:3000
```

### Production in 3 Steps
1. **Build:** `npm ci && npm run build`
2. **Configure:** set the environment variables from `.env.example` on the server.
3. **Run:** `npm start` (listens on port 3000; use `npm start -- -p 8080` or `PORT=8080 npm start` to change it). Put Nginx, Apache or a load balancer in front for HTTPS.

The `data/` directory must be writable by the Node process, because bookings are stored in `data/bookings.json`:

```bash
chmod 775 data
chmod 664 data/bookings.json
```

> **Serverless hosts (e.g. Vercel):** their filesystem is read-only/ephemeral, so `data/bookings.json` would not persist. Deploy on a VM/container (`npm start`), or move the booking store in `lib/server/bookings-store.ts` to a database before using a serverless host.

---

## 2. Directory & File Manifest

| File / Folder | Purpose & Details |
| :--- | :--- |
| `app/(home)/` | Main landing page (`/`): video hero, curated trips, trip customization modal with dynamic yield pricing, and the WhatsApp plan dispatcher. |
| `app/(mobile)/mobile/` | Mobile web app (`/mobile`): 10 destinations, holiday passes, build-your-own pass, tour packages and the ₹1,999 checkout drawers. |
| `app/(preview)/mobile-preview/` | Phone simulator (`/mobile-preview`) that frames `/mobile` in an iPhone/Pixel chassis. |
| `app/(admin)/admin/` | Admin dashboard (`/admin`): login gate, supplier hold tracker (Booked 🟢 vs Not Booked 🔴), lifecycle stages, PNR notes and CSV export. |
| `app/(legal)/legal/` | Legal pages: `/legal/privacy`, `/legal/terms`, `/legal/refund-policy`, `/legal/disclaimer`. |
| `app/api/bookings/route.ts` | Bookings REST API (`GET`, `POST`, `PUT`, `DELETE`) with CORS headers and serialized, atomic writes to `data/bookings.json`. |
| `app/api/rates/route.ts` | RateHawk B2B gateway with 15% agency markup, date-based yield fallback and buffered free-cancellation dates. |
| `app/api/lead-capture/route.ts` | Lead capture handler (validated lead record; production hook point for Sheets/email). |
| `app/globals.css` | Tailwind CSS v4 entry: brand tokens, breakpoints and compatibility rules. |
| `components/` | Page UI, grouped by page (`home/`, `mobile/`, `admin/`, `legal/`, `preview/`). |
| `lib/trips.ts` | The three curated Mauritius trips and the client-side date-yield pricing. |
| `lib/catalog/` | Multi-destination catalog data (JSON) and types used by `/mobile`. |
| `lib/server/` | Server-only code: booking store, RateHawk pricing, PHP-compatible input coercion. |
| `lib/payment-stub.ts`, `lib/site-data.ts` | Payment gateway stub and swappable crew content. |
| `data/bookings.json` | Persistent booking database (`[]` when empty). Not publicly served. |
| `public/robots.txt`, `public/sitemap.xml` | SEO configuration. |
| `next.config.ts` | Security headers and redirects/rewrites that keep the old `.html` and `.php` URLs working. |

### Old URLs
Every URL of the previous static/PHP site still works:

| Old URL | Now |
| :--- | :--- |
| `/index.html`, `/mobile-index.html`, `/tablet-index.html`, `/index updated.html` | 308 redirect to `/` |
| `/admin.html`, `/mobile.html`, `/mobile-preview.html` | 308 redirect to `/admin`, `/mobile`, `/mobile-preview` |
| `/legal/*.html` | 308 redirect to `/legal/*` |
| `/api/bookings.php`, `/api/rates.php` | Served by the new API routes (rewrite, same responses) |

---

## 3. Server Requirements

* **Runtime:** Node.js 20.9 or newer.
* **Writable storage:** the `data/` directory (see above).
* **Outbound HTTPS:** to `api.ratehawk.com` / `api-sandbox.ratehawk.com` for live rates.
* **SSL:** HTTPS certificate recommended (free Let's Encrypt).

---

## 4. Admin Portal Access & Credentials

* **URL:** `https://your-domain.com/admin`
* **Default Login ID:** `admin@passprive.travel`
* **Default Password:** `PassPrive@2026#Admin`

> The login gate runs in the browser, exactly as before, so the credentials ship in the page's JavaScript and `/api/bookings` itself is not authenticated. Treat the admin gate as a convenience, not as security.

### Key Admin Features:
1. **Supplier Booking Tracking (🔴 Not Booked vs 🟢 Booked):**
   - Click the status pill on any booking row to toggle whether you have booked the hotel on RateHawk/supplier.
   - Enter RateHawk Booking ID / PNR and internal reminder notes.
   - Real-time KPI in header tracks all pending supplier holds.
2. **Manual Lifecycle Stages:**
   - Dropdown on each row allows changing stages: `NEW_LEAD`, `COMFORT_SET`, `TOKEN_LOCKED`, `PAYMENT_OVERDUE`, `ESCALATED`, `VOUCHER_ISSUED`, `COMPLETED`, `CANCELLED`.
   - Changes auto-sync immediately to `data/bookings.json`.
3. **One-Click Actions:**
   - WhatsApp icon directly opens chat with the customer's phone number.
   - Edit Booking modal allows manual edits to amounts, notes, and dates.
   - Export CSV button downloads entire booking history.

---

## 5. WhatsApp Integration Details

* **Current Configured Number:** `+91 78382 15147` (Format: `917838215147`), set in `lib/whatsapp.ts`.
* When a customer clicks **"Send Plan to WhatsApp"** on the website modal:
  1. The inquiry is sent to `/api/bookings` and recorded in `data/bookings.json` with status `NEW_LEAD`.
  2. The customer's WhatsApp application opens with a pre-filled, rich text itinerary breakdown containing:
     - Guest Full Name & Phone Number
     - Selected Curated Trip & Category (Couple, Family, Friends)
     - Travel Dates & Nights
     - Calculated Package Price & Fixed Flight Details (DEL ⇄ MRU)
     - Full Checklist of Inclusions
     - Guaranteed Free Cancellation Deadline Date

---

## 6. Reverse Proxy Example (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

`data/` lives outside the web root, so it needs no extra protection rule.

---

## 7. RateHawk API Production Switch (When Ready)

Set these environment variables (see `.env.example`):

* `RATEHAWK_KEY_ID` and `RATEHAWK_API_TOKEN`: production credentials.
* `RATEHAWK_PRODUCTION=true`: switches from the sandbox to the production API.

Without credentials, `/api/rates` skips the live call and uses the date-based yield model. The markup margin is `MARKUP_PERCENT` in `lib/server/rates.ts`.
