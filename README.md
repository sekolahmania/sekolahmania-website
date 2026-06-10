# SekolahMania — Pembelajaran Mendalam STEM

> Platform pelatihan guru STEM interaktif untuk mendukung implementasi **Pembelajaran Mendalam** (PM) di sekolah menengah Indonesia.
>
> Founder 1: **Ayuk Ratna Puspaningsih** — Guru Biologi, SMA Negeri Bali Mandara.
> Founder 2: **I Gede Suta Piantih** — Guru Fisika dan Matematika, Private Tutor & Freelance Website Developer.

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Tangkapan Layar](#tangkapan-layar)
- [Arsitektur Frontend](#arsitektur-frontend)
- [Struktur File](#struktur-file)
- [Sections & Fitur](#sections--fitur)
- [Desain Sistem (CSS Tokens)](#desain-sistem-css-tokens)
- [JavaScript](#javascript)
- [Formulir & Backend (Convex)](#formulir--backend-convex)
- [Internasionalisasi (i18n)](#internasionalisasi-i18n)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Referensi Konten](#referensi-konten)
- [Lisensi](#lisensi)

---

## Tentang Proyek

SekolahMania adalah situs web statis satu halaman (_single-page static site_) yang dirancang sebagai platform pelatihan guru untuk program **Pembelajaran Mendalam (PM)** dari Kementerian Pendidikan Dasar dan Menengah (Kemendikdasmen) Republik Indonesia. Platform ini memuat materi, aktivitas interaktif H5P, alat perancangan RPM (_Rencana Pelaksanaan Pembelajaran Mendalam_), media hub video/dokumen, serta formulir Q&A dan umpan balik peserta.

Platform ini dibangun dengan filosofi arsitektur **zero-framework** — terinspirasi dari pendekatan Aloha Browser: HTML statis, jQuery, CSS semantik buatan sendiri, tanpa bundler, tanpa runtime, tanpa hidration overhead. Backend menggunakan **Convex** (cloud-hosted atau self-hosted) melalui HTTP Actions yang dipanggil langsung via `fetch()` dari HTML statis.

**GitHub Repository:** [https://github.com/sekolahmania/sekolahmania-website](https://github.com/sekolahmania/sekolahmania-website)

### Konteks Konten

Platform ini didasarkan pada dokumen resmi **"Pembelajaran Mendalam: Menuju Pendidikan Bermutu untuk Semua"** yang diterbitkan oleh Tim Pengembang Pembelajaran Mendalam (TPPM), Pusat Kurikulum dan Pembelajaran, Kemendikdasmen RI. Konten mencakup:

- Latar belakang: data PISA 2022 dan tantangan HOTS peserta didik Indonesia
- Definisi, prinsip, dan kerangka Pembelajaran Mendalam
- 8 Dimensi Profil Lulusan
- Tiga pengalaman belajar: Memahami → Mengaplikasi → Merefleksi
- Implementasi PM di berbagai jenjang dan mata pelajaran

---

## Tangkapan Layar

```
┌─────────────────────────────────────────────────┐
│  SekolahMania          Tentang  Materi  Unit Plan │  ← Fixed nav (blur backdrop)
├─────────────────────────────────────────────────┤
│                                                   │
│   Pembelajaran          ┌─────────────────────┐  │
│   Mendalam              │  PEMBICARA UTAMA     │  │
│   Menuju STEM           │  Ayuk Ratna          │  │  Hero section
│                         │  Puspaningsih        │  │
│   [Mulai Belajar →]     │  Guru Biologi        │  │
│   [Tentang Program]     │  SMA N Bali Mandara  │  │
│                         └─────────────────────┘  │
├─────────────────────────────────────────────────┤
│  ◆ STEM Education  ◆ Inkuiri  ◆ PISA 2022  ◆ …  │  ← Scrolling ribbon
├─────────────────────────────────────────────────┤
│  Modul Interaktif  │  8 Dimensi  │  Unit Plan    │  ← Content sections
│  PISA Data Chart   │  Media Hub  │  Q&A Form     │
└─────────────────────────────────────────────────┘
```

---

## Arsitektur Frontend

| Aspek              | Keputusan                               | Alasan                                      |
| ------------------ | --------------------------------------- | ------------------------------------------- |
| **Framework**      | Tidak ada (MPA statis)                  | Zero hydration overhead, fully crawlable    |
| **Rendering**      | Static HTML hand-authored               | No SSR runtime, instant TTFB                |
| **Styling**        | Custom CSS semantik + BEM-adjacent      | Tidak ada utility framework lock-in         |
| **Interaktivitas** | jQuery 3.7.0 (CDN + SRI)                | Budget interaktivitas sederhana             |
| **Bundler**        | Tidak ada                               | Zero build complexity, deploy via scp/rsync |
| **Animasi**        | Intersection Observer + CSS transitions | No GSAP dependency                          |
| **Analytics**      | Plausible.io proxy pattern              | Cookieless, bypass adblocker                |
| **i18n**           | `data-i18n` attribute pattern           | SEO-safe, English default in DOM            |
| **Cache-bust**     | Querystring integer (`?2`)              | Manual, sama seperti Aloha                  |
| **Images**         | `<picture>` WebP + PNG                  | Manual format control                       |

### Perbedaan dari Aloha (peningkatan)

- Hamburger animation dengan CSS 3-bar → X transform (Aloha tidak memiliki ini)
- Active nav link indicator via scroll Intersection tracking
- Scroll-based progress strip (sticky, show/hide)
- Back-to-top button dengan smooth scroll
- Unit Plan Builder: 4-step wizard form dengan download `.txt`
- Media tab switcher (Video / Dokumen) tanpa page reload

---

## Struktur File

```
sekolahmania-website/          # github.com/sekolahmania/sekolahmania-website
│
├── public/                  # ── WEB ROOT (yang dilayani Vercel) ──
│   ├── index.html           # Seluruh aplikasi frontend (~6.700 baris)
│   ├── manifest.json        # PWA manifest
│   ├── robots.txt           # SEO
│   ├── sitemap.xml          # SEO
│   ├── css/
│   │   └── style.css        # CSS terekstraksi (Roadmap 1.1 — opsional)
│   ├── js/
│   │   └── app.js           # Logika jQuery terekstraksi (Roadmap 1.1 — opsional)
│   └── img/                 # Aset gambar
│       ├── logo.svg         # Logo nav (vektor)
│       ├── logo.png         # Logo fallback PNG
│       ├── favicon.ico      # Favicon ICO
│       ├── favicon.svg      # Favicon vektor
│       ├── icon-192.png     # Ikon PWA 192×192
│       ├── icon-512.png     # Ikon PWA 512×512
│       ├── ayuk-ratna.webp  # Foto narasumber (Ayuk Ratna)
│       └── suta-pinatih.webp # Foto pengembang (Suta)
│
├── convex/                  # ── Convex backend (deploy dari sini) ──
│   ├── _generated/          # Auto-generated — jangan diedit manual
│   ├── schema.ts            # Definisi 3 dokumen (questions, feedback, unit_plans)
│   ├── mutations.ts         # Fungsi write (insertQuestion/Feedback/UnitPlan)
│   ├── queries.ts           # Fungsi read (listRecentQuestions)
│   └── http.ts              # HTTP Action router + CORS
│
├── convex-server/           # Self-hosted Convex (Docker) — opsional
│   └── docker-compose.yml
│
├── package.json             # Dependency convex + skrip deploy
├── vercel.json              # Rewrites Plausible + cache & security headers
├── .gitignore               # Melindungi .env.local, node_modules, _generated
├── .env.local               # Konfigurasi Convex (JANGAN commit)
├── .env.local.example       # Template kredensial
├── README.md                # Dokumentasi ini
└── CONVEX_MIGRATION.md      # Panduan migrasi Supabase → Convex
```

> **Penting — kenapa `index.html` ada di dalam `public/`:** Saat framework preset Vercel = **"Other"**, Vercel otomatis menjadikan folder `public/` sebagai *output directory* (web root) bila folder itu ada. Karena itu seluruh berkas yang dilayani publik (HTML, gambar, manifest) harus berada di `public/`, sedangkan berkas backend & konfigurasi (`convex/`, `package.json`, `vercel.json`) tetap di root repo. Dengan susunan ini, path aset menjadi bersih: `/img/logo.svg`, `/manifest.json`, `/css/style.css`.

### `.env.local` — Konfigurasi Convex

```bash
# .env.local — JANGAN commit file ini ke Git (sudah ada di .gitignore)
CONVEX_SELF_HOSTED_URL=http://127.0.0.1:3210
CONVEX_SELF_HOSTED_ADMIN_KEY=convex-self-hosted|<hex-key>
```

> ⚠️ **Penting:** Key harus menyertakan prefix `convex-self-hosted|` secara lengkap — termasuk karakter `|`. Menghilangkan prefix ini menyebabkan error `401 Unauthorized: BadAdminKey` saat `npx convex deploy`.

---

## Sections & Fitur

### 1. `#hero` — Hero Section

- Layout 2-kolom: teks kiri, Speaker Card kanan
- Animasi `fadeUp` bertahap (CSS keyframe, no JS)
- Speaker Card dengan avatar initial, rotating ring, topic tags, PM badge
- Stats row: 5 Modul · 8 Dimensi · 3 Pengalaman Belajar
- Responsive: stack 1 kolom di mobile

### 2. Program Ribbon

- Marquee horizontal infinite scroll (`animation: scrollX`)
- Pause on hover
- Konten: keyword-keyword PM dan STEM

### 3. `#tentang` — Pembelajaran Mendalam

- Diagram cincin konsentris (CSS pure, no SVG library)
- 3 kartu prinsip: Berkesadaran · Bermakna · Menggembirakan
- 4 Pilar Olah (Pikir, Hati, Rasa, Raga) sebagai dark cards

### 4. `#mengapa` — Data PISA 2022

- Big stat: >99% LOTS / <1% HOTS
- Stacked bar chart (CSS flex, no chart library) untuk Membaca / Matematika / Sains
- Legend interaktif dengan tooltip via `title` attribute
- Catatan solusi PM di bawah chart

### 5. `#materi` — 6 Modul Pelatihan

- Grid 3×2 module cards dengan header gradient per modul
- Setiap card: nomor modul, judul, deskripsi, 4 topik sub-item

### 6. `#dimensi` — 8 Dimensi Profil Lulusan

- Grid 4×2 cards dengan top border gradient
- Setiap card: nomor, emoji, judul, deskripsi singkat
- Scroll reveal bertahap dengan `reveal-delay`

### 6b. `#panduan` — Panduan STEM ⭐ (BARU)

Ringkasan lengkap **Panduan Pembelajaran STEM** (BSKAP, Kemendikdasmen RI 2025, 298 halaman) yang digabung dari `panduan-stem-sma.html`:

- **STEM letter grid** — 4 kartu S·T·E·M dengan warna khas (teal/amber/navy/red)
- **7-tab switcher** (`switchPanduan()`): Pendahuluan · Kerangka · Pemangku Kepentingan · Implementasi · Fokus SMA · Asesmen · Istilah
- Konten kaya: accordion model pembelajaran (PjBL, 5E, Laboy-Rush), tabel asesmen, contoh proyek SMA (perubahan iklim + distribusi normal), glosarium
- Accordion `slideUp/slideDown`, tabel responsif, callout boxes (teal/amber/navy)

### 7. `#aktivitas` — Aktivitas H5P

- 6 activity cards di dark navy background
- Badge jenis: H5P Course Presentation, Documentation Tool, Branching Scenario, YouTube, Interactive Video, Google Drive
- Feature list dengan custom checkmark bullets

### 8. `#unitplan` — Unit Plan Builder ⭐

4-step wizard form untuk merancang RPM:

| Langkah               | Konten                                                                      |
| --------------------- | --------------------------------------------------------------------------- |
| 1. Identifikasi       | Mata pelajaran, kelas/fase, waktu, profil peserta didik, 8 Dimensi checkbox |
| 2. Desain             | Tujuan pembelajaran, topik, praktik pedagogis, lingkungan, kemitraan        |
| 3. Pengalaman Belajar | Textarea: Memahami / Mengaplikasi / Merefleksi                              |
| 4. Asesmen            | Diagnostik, formatif, sumatif, catatan tambahan                             |

**Output:** Generate file `.txt` dan download otomatis via `data:` URI. Data juga dikirim ke Convex via `fetch(CONVEX_HTTP_URL + '/submitUnitPlan', ...)` dan disimpan di collection `unit_plans`.

### 9. `#media` — Media Hub

Tab switcher antara dua panel:

- **Video Sesi** — 6 video card dengan thumbnail gradient, play button, durasi, judul
- **Dokumen & Template** — 8 drive items (PDF, DOCX, XLSX, PPTX) dengan ikon type-color

### 10. `#alur` — Alur Pengalaman Belajar

- 3-step horizontal flow dengan connecting line CSS
- Setiap tahap: circle number, kicker, judul, deskripsi, topic tags berwarna
- Responsive: stack vertikal di mobile, garis connector disembunyikan

### 11. `#tanya` — Tanya Jawab

- Form: nama, sekolah, topik (dropdown), pertanyaan (textarea)
- Sidebar: tips pertanyaan efektif + kartu info pembicara
- Success message dengan `fadeIn/fadeOut`

### 12. `#feedback` — Umpan Balik (CTA)

- Star rating interaktif (1–5 ⭐) dengan visual toggle
- Form: nama, sekolah, sesi (dropdown), rating, pesan
- Dark gradient section background

### Progress Strip & Back-to-Top

- **Progress Strip:** sticky bar dengan 6 segment bar (satu per modul), muncul setelah scroll 500px, menghilang di hero
- **Back-to-Top:** tombol bulat kiri kanan bawah, muncul setelah 400px scroll

---

## Desain Sistem (CSS Tokens)

Semua warna dan font didefinisikan sebagai CSS Custom Properties di `:root`:

```css
/* Palette */
--navy: #0d2137 /* Background gelap utama */ --teal: #0e7c6e
  /* Warna brand primer */ --teal-mid: #14a090 /* Hover/active teal */
  --teal-lt: #3ecab7 /* Aksen terang */ --amber: #f59d2a /* CTA, highlight */
  --amber-lt: #ffd27f /* Hover amber */ --cream: #fbf8f3
  /* Background terang utama */ --cream2: #f2ede4
  /* Background terang alternatif */ /* Typography */ --display: "Fraunces"
  /* Display/heading — editorial serif */ --body: "Figtree"
  /* Body — humanist sans */ --mono: "JetBrains Mono" /* Label, kicker, badge */
  /* Semantic ink */ --ink: #0d2137 /* Teks utama */ --ink2: #2e4a5f
  /* Teks sekunder */ --ink3: #5c7a8a /* Teks tersier */ --ink4: #8fa4b0
  /* Teks placeholder */ /* Border */ --border: #d8e4e0 --border2: #c2d6d0;
```

### Responsive Utilities (Aloha-style)

```css
.d-mobile {
  display: none !important;
} /* Hidden di desktop */
.d-desktop {
  display: flex !important;
} /* Visible di desktop */

@media (max-width: 900px) {
  .d-mobile {
    display: flex !important;
  }
  .d-desktop {
    display: none !important;
  }
}
```

---

## JavaScript

Semua logika ditulis dengan jQuery 3.7.0 mengikuti pola Aloha Browser (global `onclick` handlers, `$(document).ready()`). Tidak ada module system, tidak ada event delegation abstraction.

### Konfigurasi

```javascript
// ── State ──────────────────────────────────────
var currentRating = 0;
var upfCurrentStep = 1;
var upfTotalSteps = 4;

// ── Convex HTTP Actions config ─────────────────
// LOCAL DEV:  "http://127.0.0.1:3211"
// CLOUD:      "https://<your-slug>.convex.site"
// SELF-HOST:  "https://convex.sekolahmania.com"
var CONVEX_HTTP_URL = "https://<your-slug>.convex.site";
```

### Fungsi Global (`onclick` pattern)

```javascript
openNav(); // Buka mobile sidenav
closeNav(); // Tutup mobile sidenav
jumpToSection(id); // Smooth scroll ke section ID
setRating(val); // Set star rating (1–5)
switchTab(panel, btn); // Ganti tab Video/Dokumen
goToUPFStep(n); // Navigasi ke step Unit Plan Builder
upfNext(); // Step berikutnya di wizard
upfBack(); // Step sebelumnya di wizard
upfSubmit(); // Validasi + generate + download RPM
submitQA(); // Kirim pertanyaan Q&A
submitFeedback(); // Kirim umpan balik
```

### Fungsi Internal

```javascript
upfGoTo(step); // Core wizard navigation
generateUnitPlanText(data); // Render RPM sebagai plain text
downloadFile(filename, text); // Trigger browser download via data URI
```

### Scroll Listeners

Satu `$(window).on('scroll.sekolahmania')` handler mengelola:

- Nav background opacity
- Progress strip show/hide
- 6-segment progress bar fill
- Back-to-top visibility
- Active nav link highlighting (per section)

### Intersection Observer

Digunakan untuk **scroll reveal animations** (`class="reveal"`) — 67 elemen. Menggunakan `threshold: 0.1` dan `rootMargin: '0px 0px -32px 0px'`. Fallback untuk browser lama: `$('.reveal').addClass('visible')`.

---

## Formulir & Backend (Convex)

Semua form (`submitQA`, `submitFeedback`, `upfSubmit`) memanggil **Convex HTTP Actions** — endpoint HTTPS publik yang dapat dipanggil langsung dari `fetch()` tanpa SDK khusus. Tidak ada `apikey` header. Tidak ada SQL.

### Arsitektur Convex untuk Proyek Ini

```
index.html (static, zero-framework)
  └── fetch(CONVEX_HTTP_URL + '/submitQuestion', { method: 'POST', ... })
  └── fetch(CONVEX_HTTP_URL + '/submitFeedback', { method: 'POST', ... })
  └── fetch(CONVEX_HTTP_URL + '/submitUnitPlan', { method: 'POST', ... })

Convex backend (cloud atau self-hosted Docker)
  ├── convex/schema.ts      ← Definisi dokumen (pengganti SQL DDL)
  ├── convex/mutations.ts   ← Fungsi database write
  └── convex/http.ts        ← HTTP Action router + CORS handler
```

### `convex/schema.ts` — Struktur Dokumen

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  questions: defineTable({
    name: v.string(),
    school: v.optional(v.string()),
    subject: v.optional(v.string()),
    message: v.string(),
    // Catatan: TIDAK ada field created_at —
    // Convex mengelola _creationTime secara otomatis
  }),
  feedback: defineTable({
    name: v.string(),
    school: v.optional(v.string()),
    session: v.optional(v.string()),
    rating: v.optional(v.number()),
    message: v.string(),
  }),
  unit_plans: defineTable({
    mapel: v.string(),
    kelas: v.optional(v.string()),
    waktu: v.optional(v.string()),
    profil: v.optional(v.string()),
    tujuan: v.string(),
    topik: v.optional(v.string()),
    pedagogi: v.optional(v.string()),
    lingkungan: v.optional(v.string()),
    mitra: v.optional(v.string()),
    memahami: v.optional(v.string()),
    mengaplikasi: v.optional(v.string()),
    merefleksi: v.optional(v.string()),
    as_awal: v.optional(v.string()),
    as_proses: v.optional(v.string()),
    as_akhir: v.optional(v.string()),
    catatan: v.optional(v.string()),
    dimensi: v.array(v.string()),
  }),
});
```

> ⚠️ **Jangan kirim `created_at`** dari JavaScript — ini bukan field yang terdaftar di schema. Convex menyimpan timestamp otomatis di field internal `_creationTime`. Mengirim `created_at` akan menyebabkan schema validation error pada HTTP Action.

### Deploy Convex Functions

```bash
# Cloud (convex.dev)
npx convex deploy

# Self-hosted (Docker lokal)
npx convex deploy \
  --url http://127.0.0.1:3210 \
  --admin-key 'convex-self-hosted|<your-hex-key>'
```

### Self-Hosting dengan Docker

```bash
# 1. Download dan jalankan
curl -o docker-compose.yml \
  https://raw.githubusercontent.com/get-convex/convex-backend/main/self-hosted/docker/docker-compose.yml
docker compose up -d

# 2. Generate admin key — SALIN OUTPUT LENGKAP termasuk prefix "convex-self-hosted|"
docker compose exec backend ./generate_admin_key.sh
# Output: convex-self-hosted|01153db53d52b8a1abf9a14a01f580c4...

# 3. Simpan ke .env.local (DENGAN prefix lengkap)
CONVEX_SELF_HOSTED_URL=http://127.0.0.1:3210
CONVEX_SELF_HOSTED_ADMIN_KEY=convex-self-hosted|01153db53d52b8a1abf9a14a01f580c4...

# 4. Deploy functions
npx convex deploy
```

**Port default self-hosted:**

| Service               | Port   | Keterangan                                  |
| --------------------- | ------ | ------------------------------------------- |
| Convex API (internal) | `3210` | Deploy target, admin operations             |
| HTTP Actions (publik) | `3211` | Endpoint yang dipanggil `fetch()` dari HTML |
| Dashboard UI          | `6791` | Browser admin panel                         |

### Update `CONVEX_HTTP_URL` di `index.html`

```javascript
// Setelah deploy, update baris ini di public/index.html:
var CONVEX_HTTP_URL = "https://<your-slug>.convex.site"; // cloud
// atau
var CONVEX_HTTP_URL = "https://convex.sekolahmania.com"; // self-hosted dengan domain
// atau (development lokal saja):
var CONVEX_HTTP_URL = "http://127.0.0.1:3211";
```

Panduan lengkap migrasi dari Supabase ke Convex tersedia di [`CONVEX_MIGRATION.md`](./CONVEX_MIGRATION.md).

---

## Internasionalisasi (i18n)

Menggunakan pola **SEO-safe `data-i18n` fallback** dari Aloha Browser:

```html
<!-- Teks default (Bahasa Indonesia) ada langsung di HTML — bisa di-crawl mesin pencari -->
<span class="progress-label" data-i18n="progress_label">Progress Modul</span>
```

```javascript
// Loader locale (uncomment untuk aktivasi):
var lang = navigator.language.slice(0, 2) || "id";
$.getJSON("/js/i18n/" + lang + ".json?1", function (strings) {
  $("[data-i18n]").each(function () {
    var key = $(this).data("i18n");
    if (strings[key]) $(this).text(strings[key]);
  });
});
```

Buat file `/js/i18n/en.json` untuk support bilingual Indonesia–Inggris (target wisatawan di platform NusaBaliConnect jika diintegrasikan).

---

## Deployment

### Vercel (Rekomendasi)

```bash
# 1. Push ke GitHub
git init && git add . && git commit -m "init: SekolahMania v1.1"
git remote add origin https://github.com/sekolahmania/sekolahmania-website.git
git push -u origin main

# 2. Import di vercel.com → New Project → pilih repo
# 3. Build settings:
#    Framework Preset = "Other"
#    Build Command    = (kosongkan)
#    Output Directory = public   (otomatis terdeteksi karena folder public/ ada)
```

> Karena `public/` berisi `index.html`, Vercel ("Other" preset) otomatis melayani `public/` sebagai root. Jangan set Output Directory ke `.` — itu akan membuat Vercel mencari `index.html` di root repo dan menghasilkan 404.

### Plausible Analytics Proxy (Aloha Takeaway #3)

Tambahkan ke `vercel.json` agar analytics tidak diblok adblocker:

```json
{
  "rewrites": [
    {
      "source": "/stats/api/event",
      "destination": "https://plausible.io/api/event"
    },
    {
      "source": "/stats/script.js",
      "destination": "https://plausible.io/js/script.js"
    }
  ]
}
```

Lalu ubah script Plausible di HTML:

```html
<script
  defer
  data-domain="sekolahmania.com"
  data-api="/stats/api/event"
  src="/stats/script.js"
></script>
```

### Cache Headers (nginx / Vercel)

```nginx
# File dengan content-hash (images, fonts) — cache permanen
location ~* \.(webp|png|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# HTML — jangan cache (selalu fresh)
location ~* \.html$ {
  expires -1;
  add_header Cache-Control "no-cache, no-store";
}
```

### Cache-Busting Manual (Aloha pattern)

Setiap kali mengubah `scripts.js` atau file i18n, naikkan querystring integer:

```html
<!-- Sebelum -->
<script src="scripts.js?2"></script>

<!-- Setelah update -->
<script src="scripts.js?3"></script>
```

> Untuk production yang lebih robust, gunakan content-hash otomatis seperti yang direkomendasikan di Aloha Blueprint: `scripts.a3f92b.js`

---

## Berkas Pendukung Deployment

Semua berkas berikut sudah disertakan dan siap dipakai:

| Berkas                             | Fungsi                                                         |
| ---------------------------------- | -------------------------------------------------------------- |
| `public/index.html`                | Aplikasi utama (~6.700 baris) — termasuk Panduan STEM          |
| `public/img/*`                     | Logo, favicon, ikon PWA, foto narasumber & pengembang          |
| `public/manifest.json`             | PWA manifest (installable, theme color, ikon)                  |
| `public/robots.txt` + `sitemap.xml`| SEO dasar                                                      |
| `public/css/style.css`             | CSS terekstraksi (Roadmap 1.1) — opsional                      |
| `public/js/app.js`                 | Logika jQuery terekstraksi (Roadmap 1.1) — opsional            |
| `convex/schema.ts`                 | Definisi 3 tabel dokumen (questions, feedback, unit_plans)     |
| `convex/mutations.ts`              | Fungsi write (insert Question/Feedback/UnitPlan)               |
| `convex/queries.ts`                | Fungsi read `listRecentQuestions`                              |
| `convex/http.ts`                   | HTTP Actions router + CORS (3 endpoint form)                   |
| `convex-server/docker-compose.yml` | Self-hosted Convex (backend + dashboard)                       |
| `package.json`                     | Dependency `convex` + skrip `dev`/`deploy`/`deploy:selfhosted` |
| `.env.local.example`               | Template kredensial Convex (salin → `.env.local`)              |
| `.gitignore`                       | Melindungi `.env.local`, `node_modules`, `convex/_generated`   |
| `vercel.json`                      | Plausible proxy rewrites + cache headers + security headers    |

### Urutan deploy yang disarankan

```bash
# 1. Backend Convex (pilih cloud ATAU self-hosted)
npm install
npx convex deploy                      # cloud
# atau: cd convex-server && docker compose up -d   # self-hosted

# 2. Ambil HTTP Actions URL, lalu set di public/index.html:
#    var CONVEX_HTTP_URL = "https://<slug>.convex.site";

# 3. Deploy frontend ke Vercel
git add . && git commit -m "deploy: SekolahMania v1.1 + Panduan STEM"
git push
```

### Roadmap 1.1 — Ekstraksi Aset (opsional)

`public/css/style.css` dan `public/js/app.js` sudah diekstraksi dari `index.html`. Karena `public/` adalah web root, tautkan dengan path tanpa prefix `public`:

```html
<link rel="stylesheet" href="/css/style.css?v=1.1" />
<!-- jQuery + html2pdf dulu, baru: -->
<script src="/js/app.js?v=1.1" defer></script>
```

> Saat ini `index.html` tetap memakai versi inline agar tetap satu berkas (zero-config deploy). Ekstraksi berguna saat tim bertambah atau caching antar-halaman jadi prioritas.

---

## Roadmap

### v1.0 — MVP ✅

- [x] Landing page lengkap (12 sections, termasuk Panduan STEM)
- [x] Unit Plan Builder 4-step wizard
- [x] Media Hub (Video + Dokumen tabs)
- [x] Q&A Form + Feedback Form
- [x] Responsive mobile-first
- [x] Progress strip + Back-to-top
- [x] Convex HTTP Actions (Q&A, Feedback, Unit Plan) — live
- [x] Panduan STEM digabung dari `panduan-stem-sma.html`

### v1.1 — Optimasi (dari Roadmap) ✅ sebagian

- [x] **1.2** Lazy-loading helper untuk `<img>`/`<iframe>` (otomatis)
- [x] **1.3** Autosave Unit Plan via `localStorage` + restore + clear-on-submit
- [x] **2.1** Export PDF profesional via `html2pdf.js` (fallback `.txt`)
- [x] **1.1** Ekstraksi CSS/JS ke `public/` (berkas siap, opsional diaktifkan)
- [x] Logo, favicon, ikon PWA, foto narasumber & pengembang terpasang
- [x] Restrukturisasi `public/` sebagai web root (siap deploy Vercel)
- [ ] **2.2** Progress tracking via xAPI (butuh embed H5P nyata — saat ini scroll-depth proxy)
- [ ] **3.1** Skenario fisika H5P (kinematika / energi terbarukan)

### v1.2 — Backend & Konten

- [ ] Admin dashboard (Convex dashboard / Next.js)
- [ ] Email notifikasi ke pembicara (Convex scheduled functions / actions)
- [ ] Realtime live Q&A feed (Convex `listRecentQuestions` + ConvexClient)
- [ ] Embed YouTube player nyata (iframe lazy-load)
- [x] Foto narasumber Ibu Ayuk Ratna Puspaningsih terpasang di speaker card
- [ ] H5P embed aktif via iFrame

### v1.3 — Fitur Lanjutan

- [ ] i18n bilingual ID/EN (aktifkan loader)
- [x] PWA manifest (`manifest.json`) — terpasang; tambah service worker untuk offline
- [ ] Plausible analytics proxy (config `vercel.json` siap)
- [ ] Pencarian materi (Fuse.js lightweight fuzzy search)
- [ ] Mode gelap/terang toggle

### v2.0 — Integrasi Ekosistem

- [ ] Multi-speaker support (lebih dari satu narasumber)
- [ ] LMS sederhana: tracking progress per peserta

---

## Referensi Konten

| Sumber               | Keterangan                                                                              |
| -------------------- | --------------------------------------------------------------------------------------- |
| Kemendikdasmen RI    | "Pembelajaran Mendalam: Menuju Pendidikan Bermutu untuk Semua"                          |
| TPPM                 | Tim Pengembang Pembelajaran Mendalam, Puskorjar                                         |
| NPDL                 | Four Elements of Learning Design © 2018 Education in Motion                             |
| John Biggs           | SOLO Taxonomy — [johnbiggs.com.au](https://www.johnbiggs.com.au/academic/solo_taxonomy) |
| Anderson & Krathwohl | Bloom's Taxonomy Revised, 2001                                                          |
| OECD                 | PISA 2022 Results                                                                       |

---

## Lisensi

Kode sumber: **MIT License** — bebas digunakan, dimodifikasi, dan didistribusikan untuk keperluan pendidikan.

Konten pedagogis (materi PM, 8 Dimensi, kerangka pembelajaran) berasal dari dokumen resmi Kemendikdasmen RI dan tunduk pada ketentuan penggunaan yang berlaku.

---

<div align="center">

Dibuat dengan ♥ untuk guru-guru Indonesia

**SekolahMania.com** · Bali, Indonesia · 2026

_Kontributor Konten: Ayuk Ratna Puspaningsih — SMA Negeri Bali Mandara_ <>
Web Developer: I Gede Suta Pinatih

</div>
