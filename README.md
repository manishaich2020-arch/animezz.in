# 🌑 OtakuVault — Anime E-Commerce

Premium anime merchandise store built with Next.js 14, NeonDB/PostgreSQL, and PayU India.

## 🚀 Quick Start

### 1. Install Docker Desktop
Download from https://www.docker.com/products/docker-desktop/

### 2. Start the database
```bash
docker compose up -d
```

### 3. Configure environment
The `.env.local` file is pre-configured for local Docker. Fill in optional services (PayU, Cloudinary, Resend, Google OAuth).

### 4. Push database schema
```bash
npm run db:push
```

### 5. Seed demo data
```bash
npm run db:seed
```

### 6. Run the dev server
```bash
npm run dev
```

Open http://localhost:3000

---

## ✨ Features

### Storefront
- Dark/Light theme toggle (☀️/🌙 in navbar)
- Per-product dynamic accent colors with breathing glow
- Full-text + fuzzy search with autocomplete (typo-tolerant)
- Cart with minimum order threshold progress bar
- Coupon code system
- Product reviews (verified buyers only)
- Wishlist

### Admin Panel (`/admin`)
- **Products** — Add/Edit/Delete with live color preview
- **Categories** — Full CRUD (create, edit, delete)
- **Orders** — Inline status updater (pending → shipped → delivered)
- **Inventory** — Real-time stock management
- **Customers** — User list with spend data
- **Coupons** — Create/disable/delete discount codes
- **Settings** — Theme mode, accent color picker with 8 presets + custom, announcement banner

### SEO
- Sitemap at `/sitemap.xml` (auto-generated, revalidates hourly)
- Robots.txt at `/robots.txt`
- Product structured data (JSON-LD Schema.org)
- Organization + WebSite + SearchAction schema
- Full OpenGraph + Twitter Card metadata
- Canonical URLs on every page
- Keyword-optimized titles targeting "anime merchandise India"

### Performance
- ISR (Incremental Static Regeneration) on homepage (5min) and product pages (10min)
- Suspense boundaries for progressive loading
- Next.js Image optimization
- Google Fonts with `display: swap`

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (storefront)        # Public pages
│   ├── admin/              # Admin panel
│   ├── api/                # API routes
│   └── auth/               # Auth pages
├── components/
│   ├── home/               # Homepage sections
│   ├── layout/             # Navbar, Footer
│   ├── products/           # Product card, grid
│   ├── search/             # Search bar with autocomplete
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── db/                 # Drizzle ORM schema + seed
│   ├── auth.ts             # NextAuth config
│   ├── constants.ts        # App constants
│   ├── env.ts              # Env validation
│   └── utils.ts            # Helpers
└── store/
    └── cart.ts             # Zustand cart store
```

## 🗄️ Database Commands

```bash
npm run db:push      # Push schema to DB (dev)
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio (DB GUI)
npm run db:seed      # Seed demo products & categories
```

## 🎨 Demo Products (from demo images)

| Product | Category | Price |
|---------|----------|-------|
| Attack on Titan XL Mouse Pad | Mouse Pads | ₹799 |
| Solo Leveling Arise Mouse Pad | Mouse Pads | ₹849 |
| Goku Super Saiyan Action Figure | Action Figures | ₹1,499 |
| Naruto Uzumaki Action Figure | Action Figures | ₹1,299 |
| Gojo Satoru Infinity Action Figure | Action Figures | ₹1,699 |
| Demon Slayer Tanjiro Action Figure | Action Figures | ₹1,399 |
| Jujutsu Kaisen Yuji Itadori Figure | Action Figures | ₹1,249 |
| Shin-chan Chibi Figure Set | Mini Figures | ₹599 |
| Roronoa Zoro Katana Replica | Swords | ₹2,499 |
| Solo Leveling Shadow Monarch Katana | Swords | ₹2,799 |

## 🔐 Creating an Admin User

After registering, run this SQL in Drizzle Studio or psql:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

## 💳 PayU Test Mode

The `.env.local` uses `https://test.payu.in` by default.
Get test credentials from: https://developer.payu.in/

## 🧪 Test Search

Visit http://localhost:3000/search?q=goku to test the search system.
The search uses PostgreSQL full-text search + trigram similarity for typo tolerance.

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS + Framer Motion |
| Database | PostgreSQL (Docker local / NeonDB production) |
| ORM | Drizzle ORM |
| Auth | NextAuth.js v5 (credentials + Google) |
| Payment | PayU India |
| Search | PostgreSQL FTS + pg_trgm |
| State | Zustand |
| Email | Resend |
| Images | Cloudinary / local public folder |
