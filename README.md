# Caterus

A managed catering marketplace web app. Customers can browse, compare, book, and pay vetted caterers for their events, while admins keep quality, confirmations, and payouts under control.

## Project structure

```
caterus/
├── index.html                       # Landing page
├── styles.css                       # Styles
├── script.js                        # Interactions
├── caterus-product-overview.html    # Product overview
└── assets/                          # Images and media
```

A backend will be added (e.g. a `server/` folder) to power authentication, listings, bookings, and payments.

## Running locally

This is a static site. Open `index.html` directly in a browser, or serve it:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Roadmap

- [ ] Caterer listings and search
- [ ] Booking flow
- [ ] Payments (Stripe)
- [ ] Admin dashboard (approvals, confirmations, payouts)
- [ ] Backend API and database

## License

All rights reserved.
