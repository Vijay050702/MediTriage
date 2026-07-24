# MediTriage

AI-powered medical and dental triage system with symptom checking, doctor appointment booking, and emergency services integration.

## About

MediTriage is a full-stack web application that helps patients assess their symptoms using AI-driven analysis, book doctor appointments, manage medical records, and access emergency services. It supports multiple user roles — patients, doctors, ambulance drivers, and hospital administrators — each with a dedicated dashboard.

## Features

- **AI Symptom Checker** — Analyze symptoms and get triage levels (Emergency / Urgent / Normal) with possible conditions and recommendations
- **Doctor Appointment Booking** — Search doctors by specialty, view availability, and book 30-minute slots
- **Emergency Services** — One-tap emergency calls, nearby hospital lookup, and ambulance dispatch with live tracking
- **Medical History** — View and share medical records and reports with doctors
- **Role-Based Dashboards** — Separate views for patients, doctors, ambulance drivers, and hospital admins
- **Authentication** — Email/password and phone OTP sign-in with JWT-based session management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Backend / Database | Supabase (PostgreSQL, Auth, Edge Functions) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/Vijay050702/MediTriage.git
cd MediTriage/client
npm install
```

### Environment Variables

Create a `.env` file inside the `client/` directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

See `client/.env.example` for reference.

### Run the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Other Commands

```bash
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Project Structure

```
MediTriage/
├── client/                    # React frontend
│   ├── public/                # Static assets (icons, favicon)
│   ├── src/
│   │   ├── assets/            # Images and SVGs
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React context (Auth, Notifications)
│   │   ├── data/              # Mock data and reference data
│   │   ├── lib/               # Supabase client setup
│   │   ├── pages/             # Page components
│   │   └── styles/            # Global CSS
│   └── .env.example
├── supabase/                  # Supabase config and edge functions
│   ├── config.toml
│   └── functions/             # Serverless edge functions
├── supabase_schema.sql        # Database schema
├── supabase_migration.sql     # Migration queries
├── supabase_fix.sql           # Fix queries
├── supabase_cron_setup.sql    # Cron job setup
└── SPEC.md                    # Full project specification
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Home page with feature overview |
| `/signup` | Sign Up | Register as Patient, Doctor, or Driver |
| `/signin` | Sign In | Email/password or phone OTP login |
| `/dashboard` | Dashboard | Role-specific home dashboard |
| `/symptoms` | Symptom Checker | AI-powered symptom analysis |
| `/appointments` | Appointments | Book and manage doctor appointments |
| `/emergency` | Emergency | Emergency services and ambulance dispatch |
| `/medical-history` | Medical History | View personal medical records |
| `/patients` | Patients | Doctor view of patient list |
| `/hospital-dashboard` | Hospital Dashboard | Admin hospital management |

## License

MIT
