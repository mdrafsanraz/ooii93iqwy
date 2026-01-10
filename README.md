# RDistro Registration System

A professional registration form for RDistro music distribution service with admin dashboard. Built with Next.js 14, TypeScript, Tailwind CSS, Stripe, and Resend.

## Features

- 🎨 **Clean Light Theme** - White background, professional design
- 📱 **Mobile Friendly** - Fully responsive on all devices
- 💳 **Stripe Payments** - Secure payment processing
- 📧 **Email Notifications** - Automatic emails via Resend
- 👨‍💼 **Admin Dashboard** - View all registrations and payment status
- ⚡ **Vercel Ready** - One-click deployment

## Plans

| Plan | Price | Features |
|------|-------|----------|
| Artist | $5/year | Unlimited releases, 150+ platforms, 100% royalties |
| Label | $20/year | Multi-artist management, Priority support, Dedicated manager |

## Quick Start

### 1. Install Dependencies

```bash
cd "user collect"
npm install
```

### 2. Configure Environment

Create `.env.local` with your credentials:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your_secure_password
```

### 3. Run Development Server

```bash
npm run dev
```

- Registration Form: [http://localhost:3000](http://localhost:3000)
- Admin Dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Registration | `/` | Main registration form |
| Success | `/success` | Payment success page |
| Admin | `/admin` | Admin dashboard (password protected) |

## Admin Dashboard

Access at `/admin` with your `ADMIN_PASSWORD`. Features:

- **Stats Overview** - Total, pending, completed registrations & revenue
- **Registration List** - All submissions with details
- **Payment Status** - Track succeeded/pending/failed payments
- **Account Status** - Mark accounts as created
- **Auto Refresh** - Updates every 30 seconds

## Setup Instructions

### Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copy your **Secret key** → `STRIPE_SECRET_KEY`

### Resend (Email)

1. Create account at [Resend](https://resend.com)
2. Verify your domain (rdistro.com)
3. Get API key → `RESEND_API_KEY`

**Note:** Update the `from` email in API routes to match your verified domain.

## Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
4. Add custom domain `app.rdistro.com`

## Project Structure

```
├── app/
│   ├── admin/page.tsx              # Admin dashboard
│   ├── api/
│   │   ├── admin/registrations/    # Admin API
│   │   ├── create-payment-intent/  # Stripe payment
│   │   └── send-notification/      # Email + save registration
│   ├── success/page.tsx            # Success page
│   ├── globals.css                 # Styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Registration form
├── components/
│   └── CheckoutForm.tsx            # Stripe checkout
├── lib/
│   └── registrations.ts            # Registration storage
└── package.json
```

## Storage Note

Currently uses in-memory storage for demo purposes. For production, consider:

- **Vercel KV** - Redis-compatible key-value store
- **Vercel Postgres** - PostgreSQL database
- **MongoDB Atlas** - Document database
- **Supabase** - PostgreSQL with real-time

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Payments:** Stripe
- **Emails:** Resend

---

Built for RDistro
