# Meta Funnel - Multi-Marketer WhatsApp Landing Page System

A full-stack platform where multiple marketers share one landing page but each receives leads to their own WhatsApp number. Super Admin controls everything from an admin dashboard.

## Tech Stack

- **Backend:** Node.js, Express.js, Supabase (PostgreSQL + Auth)
- **Frontend:** Next.js 14 (App Router), React, TailwindCSS
- **Charts:** Recharts
- **QR Codes:** qrcode.react

## Project Structure

```
├── backend/                # Express API server
│   ├── server.js           # Entry point
│   ├── lib/supabase.js     # Supabase client
│   ├── middleware/auth.js   # JWT auth & role middleware
│   ├── routes/             # Route definitions
│   │   ├── auth.js         # Login / signup
│   │   ├── public.js       # Landing page data & click tracking
│   │   ├── marketer.js     # Marketer dashboard APIs
│   │   └── admin.js        # Admin management APIs
│   └── controllers/        # Business logic
│       ├── authController.js
│       ├── publicController.js
│       ├── marketerController.js
│       └── adminController.js
│
├── frontend/               # Next.js application
│   ├── app/
│   │   ├── page.js         # Public landing page
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup page
│   │   ├── admin/          # Admin dashboard
│   │   │   ├── dashboard/  # Analytics overview
│   │   │   ├── marketers/  # CRUD marketers
│   │   │   └── settings/   # Edit landing page content
│   │   └── dashboard/      # Marketer dashboard
│   │       ├── stats/      # Click statistics
│   │       └── profile/    # Profile & QR code
│   ├── components/         # Shared UI components
│   └── lib/                # API client & auth context
│
└── database/
    └── schema.sql          # Supabase database schema
```

## Setup

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `database/schema.sql`
3. Copy your project URL and keys from **Settings > API**

### 2. Create Admin User

In the Supabase dashboard:

1. Go to **Authentication > Users** and create a user (your admin email/password)
2. Run this SQL to set them as admin (replace the auth user ID):

```sql
INSERT INTO public.users (auth_id, email, role)
VALUES ('YOUR_AUTH_USER_ID', 'admin@example.com', 'admin');
```

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials and JWT secret
npm install
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env with your API URL and Supabase credentials
npm install
npm run dev
```

### 5. Environment Variables

**Backend `.env`:**
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) |
| `FRONTEND_URL` | Frontend URL for CORS |
| `DEFAULT_WHATSAPP` | Fallback WhatsApp number |

**Frontend `.env`:**
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_SITE_URL` | Public site URL |

## How It Works

1. **Landing page** loads at `/?ref=john`
2. System reads the `ref` parameter
3. Fetches the marketer's WhatsApp number from the database
4. **Join WhatsApp** button dynamically updates with that number
5. Click is tracked in the database
6. If no `ref` is provided, the default admin number is used

## User Roles

### Super Admin
- Create / edit / delete marketers
- Approve WhatsApp numbers
- Edit all landing page content
- View analytics & click charts
- Track top-performing marketers

### Marketer
- View their unique referral link
- Copy referral link & QR code
- Update their WhatsApp number
- View click statistics & charts

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/signup` | Register marketer | Public |
| GET | `/api/public/marketer/:ref` | Get marketer by ref code | Public |
| POST | `/api/public/click/:ref` | Track a click | Public |
| GET | `/api/public/content` | Get landing page content | Public |
| GET | `/api/marketer/profile` | Get marketer profile | Marketer |
| PUT | `/api/marketer/update-number` | Update WhatsApp number | Marketer |
| GET | `/api/marketer/stats` | Get click statistics | Marketer |
| GET | `/api/admin/marketers` | List all marketers | Admin |
| POST | `/api/admin/marketers` | Create marketer | Admin |
| PUT | `/api/admin/marketers/:id` | Update marketer | Admin |
| DELETE | `/api/admin/marketers/:id` | Delete marketer | Admin |
| GET | `/api/admin/analytics` | Get platform analytics | Admin |
| PUT | `/api/admin/content` | Update landing page content | Admin |

## Deployment

### Backend (e.g., Railway, Render, Fly.io)
1. Set all environment variables
2. Build command: `npm install`
3. Start command: `npm start`

### Frontend (e.g., Vercel)
1. Set all `NEXT_PUBLIC_*` environment variables
2. Framework: Next.js
3. Build command: `npm run build`
4. Output directory: `.next`

## Security

- Supabase Row Level Security (RLS) policies
- JWT-based authentication
- Role-based access control (admin / marketer)
- Rate limiting on all endpoints
- Stricter rate limiting on auth endpoints
- Helmet security headers
- Input validation on all endpoints
- CORS configured for frontend origin only
