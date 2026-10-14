# PassPrivé Travel — Complete Deployment & Developer Handover Guide

> **Version:** 3.0.0 Production Release  
> **Destination:** Mauritius Luxury & Curated Journeys  
> **WhatsApp Hotline:** `+91 78382 15147` (`917838215147`)  
> **Admin Login:** `admin@passprive.travel` | `PassPrive@2026#Admin`

---

## 1. Quick Start (Zero-Configuration Drop-In Deployment)

This project is engineered as a **high-performance, zero-dependency, plug-and-play web application**. 
Your developer does **not** need to run `npm install`, compile assets, configure webpack, or run database migrations.

### Deployment in 3 Steps:
1. **Upload:** Copy all contents of this folder into your web server's web root (e.g. `public_html/` or subdomain folder).
2. **Permissions:** Ensure the `data/` directory is writable by PHP:
   ```bash
   chmod 775 data
   chmod 664 data/bookings.json
   ```
3. **Launch:** Open your website domain in any browser — it will work instantly!

---

## 2. Directory & File Manifest

| File / Folder | Type | Purpose & Details |
| :--- | :--- | :--- |
| `index.html` | Core Frontend | Main responsive landing page with luxury video hero background, dynamic yield calendar, curated trips, interactive modal, and automated WhatsApp trip plan dispatcher. |
| `mobile-index.html` | Mirror | Dedicated mobile version mirror. |
| `tablet-index.html` | Mirror | Dedicated tablet version mirror. |
| `index updated.html` | Backup Mirror | Verified working backup mirror. |
| `mobile.html` | Mobile Web App | Lightweight mobile experience optimized for fast 4G/5G handheld networks. |
| `mobile-preview.html` | Simulator Tool | Interactive iPhone 16 Pro simulator frame with Dynamic Island for showcasing mobile UI on desktop browsers. |
| `admin.html` | Management Portal | Vercel-style secured Admin Dashboard with login gate, supplier hold tracker (Booked 🟢 vs Not Booked 🔴), manual lifecycle stages, RateHawk PNR tracking, and CSV export. |
| `destinationsCatalog.js` | Catalog Data | Destination packages, hotel configurations, inclusions, and descriptions. |
| `api/bookings.php` | Backend API | Production REST API for booking management (`GET`, `POST`, `PUT`, `DELETE`) with CORS headers, atomic file locking (`flock`), and JSON responses. |
| `api/rates.php` | Backend API | RateHawk B2B API gateway with 15% agency markup calculation, fallback rates, and dynamic cancellation cutoff dates. |
| `api/.htaccess` | Security Config | API directory protection with CORS headers and directory listing disabled. |
| `data/bookings.json` | Persistent Database | Clean empty JSON database (`[]`) ready to capture live customer inquiries. |
| `data/.htaccess` | Security Config | Apache security directive blocking direct public HTTP downloads of `bookings.json`. |
| `legal/` | Legal Pages | Complete GDPR & Indian consumer compliance suite (`privacy.html`, `terms.html`, `refund-policy.html`, `disclaimer.html`). |
| `src/` | Design Tokens | Token styling (`tokens.css`) and shared constants (`site-data.js`). |
| `.htaccess` | Server Config | Production Apache rules: MIME types for video/audio, Gzip compression, cache directives, security headers. |
| `robots.txt` | SEO Config | Search engine crawler rules protecting admin and API while indexing landing pages. |
| `sitemap.xml` | SEO Config | XML sitemap for Google and Bing indexing. |

---

## 3. Server Requirements

* **Web Server:** Apache 2.4+ (recommended) or Nginx.
* **PHP Version:** PHP 7.4, 8.0, 8.1, 8.2, or 8.3.
* **PHP Extensions:** `curl`, `json`, `mbstring` (standard on virtually all shared and cloud hosting platforms).
* **SSL:** HTTPS certificate recommended (free Let's Encrypt / AutoSSL).

---

## 4. Admin Portal Access & Credentials

* **URL:** `https://your-domain.com/admin.html`
* **Default Login ID:** `admin@passprive.travel`
* **Default Password:** `PassPrive@2026#Admin`

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

* **Current Configured Number:** `+91 78382 15147` (Format: `917838215147`)
* When a customer clicks **"Send Plan to WhatsApp"** on the website modal:
  1. The inquiry is automatically sent to `api/bookings.php` and recorded in `data/bookings.json` with status `NEW_LEAD`.
  2. The customer's WhatsApp application opens with a pre-filled, rich text itinerary breakdown containing:
     - Guest Full Name & Phone Number
     - Selected Curated Trip & Category (Couple, Family, Friends)
     - Travel Dates & Nights
     - Calculated Package Price & Fixed Flight Details (DEL ⇄ MRU)
     - Full Checklist of Inclusions
     - Guaranteed Free Cancellation Deadline Date

---

## 6. Nginx Configuration (If using Nginx instead of Apache)

If deploying on Nginx instead of Apache, add this block to your server configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # Protect data directory
    location ^~ /data/ {
        deny all;
        return 403;
    }

    # Pass PHP scripts to FastCGI
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    }

    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|svg|webp|ico|mp4|woff2)$ {
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    # HTML no-cache for instant updates
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
```

---

## 7. RateHawk API Production Switch (When Ready)

In [`api/rates.php`](file:///c:/Users/DELL/Desktop/passprive%20travel%20version%203/api/rates.php):
* Set `$isProduction = true;` (line 16).
* Enter production `$apiKeyId` and `$apiToken` (lines 14–15).
* Markup margin is set via `$markupPercent = 15;` (line 23).
