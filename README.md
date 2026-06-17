# Caterus

**Australia's catering marketplace** — Find, compare and book vetted caterers for any event.

## Tech Stack

- **Backend:** Node.js, Express, EJS, MySQL2
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Payments:** Stripe Checkout
- **Email:** Nodemailer (configurable SMTP)
- **Auth:** Express-session + bcrypt

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up MySQL
```bash
# Create the database and tables
mysql -u root < database/schema.sql

# Seed with demo data (optional)
mysql -u root caterus < database/seed.sql
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your MySQL credentials, Stripe keys, etc.
```

### 4. Run
```bash
npm run dev
```

Visit:
- **Public site:** http://localhost:3000
- **Admin dashboard:** http://localhost:3000/admin
- **API:** http://localhost:3000/api

### Default Admin Login
- Email: `admin@caterus.com.au`
- Password: `admin123`

## Project Structure

```
caterus/
├── config/          # Database connection
├── controllers/     # Route handlers (public + admin)
├── database/        # SQL schema + seed data
├── middleware/       # Auth + file upload middleware
├── models/          # Database models (CRUD operations)
├── public/          # Static files (CSS, JS, images, HTML)
├── routes/          # Express routes (pages, API, admin, webhooks)
├── utils/           # Email, Stripe, helpers
├── views/           # EJS templates (admin + public)
├── server.js        # Express server entry point
├── package.json
└── .env
```

## Key Features

**For Customers:**
- Search caterers by suburb, occasion, cuisine, guest count
- Browse caterer profiles with menus, photos, reviews
- Book and pay via Stripe Checkout
- Instant email confirmation
- Leave ratings and reviews

**Admin Dashboard:**
- Manage caterers, menus, images, vetting
- Track bookings, payments, payouts
- Moderate reviews
- Manage enquiries and caterer applications
- Configure SMTP and Stripe settings
- Revenue and booking analytics

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/caterers` | Search/filter caterers |
| GET | `/api/caterers/:slug` | Get caterer details |
| POST | `/api/bookings/create-checkout` | Create booking + Stripe session |
| POST | `/api/reviews` | Submit a review |
| POST | `/api/contact` | Contact enquiry |
| POST | `/api/apply` | Caterer application |
