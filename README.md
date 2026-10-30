# PawConnect / Pet Profile Hub

A faithful recreation of the **PawConnect / Pet Profile Hub** platform, built with React, TypeScript, Tailwind CSS, Express, and a persistent database backend (supporting both PostgreSQL / Supabase and atomic local persistent storage).

---

## 🌟 Features Recreated & Verified

1. **Exact UI & Design Tokens**:
   - Typography: `Fraunces` (Serif / Headings), `Plus Jakarta Sans` (Sans), `Inter`
   - Colors: Warm golden primary amber (`hsl(35, 92%, 50%)`), terracotta accent (`hsl(25, 90%, 50%)`), ivory cream background (`hsl(40, 40%, 98%)`), espresso foreground (`hsl(25, 70%, 15%)`)
   - Light, Dark, and System theme toggling with real-time DOM switching
   - Responsive layout across desktop (1280px+), tablet (768px), and mobile (375px) viewports
   - Mobile navigation slide-out sheet drawer

2. **Complete Page Inventory**:
   - `/`: Homepage with Hero, live adoption statistics banner, category browser, "Meet Our Stars" featured pet grid, "How It Works" 3-step guide, and newsletter subscription
   - `/pets`: Find a Pet catalog with live search, filtering by type (Dog, Cat, Bird, Rabbit, Other), size, and gender
   - `/pets/:id`: Detailed pet profiles with vaccination/neuter/house-trained specs, personality badges, medical history, shelter contact card, favorite button, and share action
   - `/adopt/:petId`: 9-field adoption application form with personal details, housing environment, pet experience, and agreement verification
   - `/shelters`: Partner shelters directory with address, phone, email, hours, pet counts, and links
   - `/blog`: Blog index with category filtering, featured article, and reading times
   - `/blog/:id`: Full article view with author metadata, date, and related actions
   - `/rescue`: Emergency rescue protocol reporting form with urgency levels (Low, Medium, High, Critical) and location logging
   - `/about`: Mission statement, "Why Adopt Not Shop", and 4-step adoption timeline
   - `/contact`: Contact details and working message inquiry form
   - `/login` & `/register`: Secure authentication forms with bcrypt password hashing and session tokens
   - `/dashboard`: User dashboard featuring saved favorite pets and active adoption applications tracking
   - `/admin`: Role-protected admin console to approve/reject adoption requests and add/delete pet listings
   - `404`: Dedicated Not Found error page

3. **Persistent Database & Backend**:
   - Express server with modular REST API endpoints
   - Seeded with authentic reference data (Buddy, Luna, Max, Bella, Milo, Daisy, etc.)
   - Atomic disk-persisted database engine (`pawconnect_data.json`) providing zero-setup local persistence across restarts
   - Version-controlled PostgreSQL / Supabase migration schema in `server/schema.sql` with Row Level Security (RLS) policies, indexes, and constraints

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+
- **Python 3.10+** (for integration tests and Playwright E2E verification)

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Seed Database
Populate the database with authentic reference pets, shelters, categories, and initial admin/demo users:
```bash
npm run seed
```
Initial admin and demo accounts are configured via `.env` variables:
- `ADMIN_INITIAL_EMAIL` & `ADMIN_INITIAL_PASSWORD`
- `USER_INITIAL_EMAIL` & `USER_INITIAL_PASSWORD`

### 4. Running the Development Server
Run frontend (Vite on port 3000) and backend (Express on port 5000) concurrently:
```bash
npm run dev
```

### 5. Production Build & Start
Build the optimized client bundle and run the unified production server:
```bash
npm run build
npm start
```
The application will be live at `http://localhost:5000/`.

---

## 🗄️ Supabase / PostgreSQL Setup

To connect a cloud **Supabase** instance instead of the local persistent database:

1. Create a new project in the [Supabase Dashboard](https://supabase.com).
2. Open the **SQL Editor** in your Supabase project.
3. Paste and run the entire contents of `server/schema.sql`. This sets up all tables, foreign keys, indexes, and Row Level Security policies.
4. Copy your project URL, anon key, and service role key from **Project Settings > API**.
5. Create a `.env` file from `.env.example`:
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_custom_jwt_secret_here

# Supabase Credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Direct PostgreSQL connection string (optional)
DATABASE_URL=postgresql://postgres.yourproject:password@aws-0-region.pooler.supabase.com:6543/postgres
```

---

## 🧪 Testing & Verification

### 1. Backend Integration & Database Tests
Execute the comprehensive 10-point test suite:
```bash
python tests/test_api_and_db.py
```
This verifies:
- Health check
- Pet filtering and search
- Shelters and blog listings
- User registration and login session tokens
- Adoption application creation and database persistence
- Emergency rescue report transmission
- Contact inquiry storage
- Favorites persistence in user dashboard
- Admin authorization and status approval

### 2. End-to-End Browser Tests (Playwright)
Run the headless browser verification test:
```bash
python tests/test_e2e_browser.py
```
This tests all routes, takes full-page screenshots in `tests/screenshots/`, and verifies interactive form submissions in the live browser DOM.

---

## 📁 Project Structure

```
PAWCONNECT/
├── client/
│   ├── index.html
│   ├── favicon.svg
│   └── src/
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── Footer.tsx
│       │   ├── ThemeToggle.tsx
│       │   └── ui/             # Radix & shadcn UI primitives
│       ├── pages/
│       │   ├── Home.tsx
│       │   ├── PetsCatalog.tsx
│       │   ├── PetDetail.tsx
│       │   ├── AdoptForm.tsx
│       │   ├── Shelters.tsx
│       │   ├── BlogList.tsx
│       │   ├── BlogPost.tsx
│       │   ├── RescueReport.tsx
│       │   ├── About.tsx
│       │   ├── Contact.tsx
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── Dashboard.tsx
│       │   ├── AdminDashboard.tsx
│       │   └── NotFound.tsx
│       ├── lib/
│       │   ├── api.ts
│       │   ├── auth.tsx
│       │   └── utils.ts
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
├── server/
│   ├── index.ts            # Express server entry point
│   ├── routes.ts           # REST API routes
│   ├── auth.ts             # JWT & bcrypt authentication
│   ├── db.ts               # Database access layer
│   ├── seed.ts             # Authentic seed data generator
│   └── schema.sql          # PostgreSQL / Supabase migration schema
├── tests/
│   ├── test_api_and_db.py  # Backend integration tests
│   ├── test_e2e_browser.py # Playwright browser E2E tests
│   └── screenshots/        # Captured verification screenshots
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```
