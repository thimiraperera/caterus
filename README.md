# Caterus

**Australia's catering marketplace** - find, compare and book vetted caterers for any event.

## Tech Stack

- **Backend:** Node.js, Express, EJS, MySQL2
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Payments:** Stripe Checkout
- **Email:** Nodemailer (configurable SMTP)
- **Auth:** Express-session + bcrypt
- **Hosting:** cPanel LiteSpeed + Passenger (CloudLinux Node.js Selector)

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Set up MySQL
```bash
# Create the database and tables
mysql -u root < database/schema.sql

# Seed with demo data + default admin (recommended)
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

Change this password immediately after first login.

---

## Deploy to cPanel (Zero to Hero)

Fresh deployment to a cPanel server using Git Version Control and the Node.js
Selector (Passenger). Replace the placeholders with your own values:

| Placeholder | Meaning |
|---|---|
| `USERNAME` | Your cPanel account username |
| `example.com` | The domain or subdomain you host on |
| `APPDIR` | The application folder under your home dir (for example the domain folder) |
| `NODEVER` | The Node.js version you select (18 or newer) |

### Requirements

The server must have: **Setup Node.js App** (CloudLinux Node.js Selector),
**Git Version Control**, **MySQL Databases**, **phpMyAdmin**, and **Terminal**.

### 1. Create the MySQL database

cPanel home > **MySQL Databases**.

1. **Create New Database**: `caterus`. cPanel prefixes it, so the real name is `USERNAME_caterus`.
2. **Add New User** with a strong password. The real username becomes `USERNAME_caterus`.
3. **Add User To Database** and grant **ALL PRIVILEGES**.

Keep the DB name, user, and password for the `.env` file.

### 2. Clone the repo with Git Version Control

cPanel home > **Git Version Control** > **Create**.

| Field | Value |
|---|---|
| Clone URL | `https://github.com/thimiraperera/caterus.git` |
| Repository Path | `APPDIR` (resolves to `/home/USERNAME/APPDIR`) |
| Repository Name | `caterus` |

> Clone BEFORE creating the Node.js app. Git refuses to clone into a non-empty
> folder, so empty the target folder first if it has a default page.

> For a private repo, add an SSH deploy key first (cPanel > SSH Access >
> Manage SSH Keys, then add the public key to GitHub repo > Settings >
> Deploy keys) and clone with `git@github.com:thimiraperera/caterus.git`.

### 3. Switch to the correct branch

Open **Terminal**:

```bash
cd ~/APPDIR
git fetch origin
git checkout feature/nodejs-backend
git pull origin feature/nodejs-backend
```

### 4. Import the database

cPanel home > **phpMyAdmin** > select `USERNAME_caterus`.

1. **Import** tab > `database/schema.sql` > Go. Creates all tables.
2. Import `database/seed.sql`. Creates the default admin login.
3. Optional: import `database/seed_bulk.sql` for demo caterers.

### 5. Create the Node.js application

cPanel home > **Setup Node.js App** > **Create Application**.

| Field | Value |
|---|---|
| Node.js version | `NODEVER` (highest available, 18+) |
| Application mode | `Production` |
| Application root | `APPDIR` |
| Application URL | `example.com` |
| Application startup file | `server.cjs` |

Click **Create**. This builds the virtual environment at
`/home/USERNAME/nodevenv/APPDIR/NODEVER/`. Leave the page open: the grey box
shows the exact command to enter that environment.

### 6. Create the `.env` file

`.env` is gitignored, so create it on the server. In **File Manager** open the
app folder, create `.env`, and fill in:

```ini
NODE_ENV=production
PORT=3000
BASE_URL=https://example.com

DB_HOST=localhost
DB_PORT=3306
DB_USER=USERNAME_caterus
DB_PASSWORD=your_db_password
DB_NAME=USERNAME_caterus

SESSION_SECRET=change-this-to-a-long-random-string

STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=hello@example.com
SMTP_FROM_NAME=Caterus
```

Generate a session secret with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 7. Install dependencies

Caterus uses native modules (`sharp`, `bcryptjs`) that must build against the
app's Node version. Use **Run NPM Install** on the Setup Node.js App page, or
the virtual environment in Terminal:

```bash
source /home/USERNAME/nodevenv/APPDIR/NODEVER/bin/activate
cd /home/USERNAME/APPDIR
npm install --omit=dev
```

If `sharp` fails, run `npm rebuild sharp` inside the activated environment.

### 8. Prepare writable folders

```bash
cd /home/USERNAME/APPDIR
mkdir -p public/assets/uploads tmp
chmod -R 755 public/assets/uploads
```

### 9. Start the app

Click **Restart** on the Setup Node.js App page, or:
```bash
touch /home/USERNAME/APPDIR/tmp/restart.txt
```

Then visit `https://example.com`, `/admin`, and `/api/caterers`.

### 10. First-login hardening

Log in at `/admin` with `admin@caterus.com.au` / `admin123`, then change the
password. Optionally enable two-factor (TOTP).

### 11. Configure Stripe and SMTP

**Stripe webhook:** add an endpoint `https://example.com/webhooks` in the Stripe
dashboard, select your checkout events, then put the signing secret into
`STRIPE_WEBHOOK_SECRET` and restart.

**SMTP:** set the SMTP values in `.env` or from the admin settings page, restart.

### 12. Future updates

After pushing to `feature/nodejs-backend`:

- **cPanel UI:** Git Version Control > Manage > Update from Remote > Deploy HEAD Commit (runs `.cpanel.yml`).
- **Terminal:** edit `APP_DIR`, `NODE_VER`, `BRANCH` at the top of `deploy.sh`, then run `bash deploy.sh`.

### Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| 503 / will not start | Wrong startup file or boot crash | Confirm startup file is `server.cjs`; read the log on the Node.js App page |
| `MySQL connection failed` | Wrong DB creds | Recheck `DB_*` values use the `USERNAME_` prefix and the user is added to the DB |
| Cannot log in | `seed.sql` not imported | Import `database/seed.sql` |
| Image upload errors | `sharp` not built or uploads not writable | `npm rebuild sharp`; `chmod -R 755 public/assets/uploads` |
| Payments never confirm | Stripe webhook missing | Add `/webhooks` endpoint, set `STRIPE_WEBHOOK_SECRET`, restart |
| `git clone` not empty | App created before clone | Empty the folder, clone first, then create the app |
| Changes not showing | App not restarted | `touch ~/APPDIR/tmp/restart.txt` |

---

## Project Structure

```
caterus/
├── config/          # Database connection
├── controllers/     # Route handlers (public + admin)
├── database/        # SQL schema + seed data
├── middleware/      # Auth + file upload middleware
├── models/          # Database models (CRUD operations)
├── public/          # Static files (CSS, JS, images)
├── routes/          # Express routes (pages, API, admin, webhooks)
├── utils/           # Email, Stripe, helpers
├── views/           # EJS templates (admin + public)
├── server.cjs       # Express server entry point
├── .cpanel.yml      # cPanel Git deployment tasks
├── deploy.sh        # Manual deploy script
├── package.json
└── .env             # Not committed - create on each environment
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
