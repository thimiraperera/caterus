# Caterus

Caterus is a catering marketplace web app for Australia — find, compare and book vetted caterers for any event. This repository contains the frontend.

## Pages

- `index.html` — landing page: hero search, how it works, caterer listings, occasions carousel, "for caterers" section, FAQ, contact and caterer sign-up popups.
- `caterer.html` — single caterer page: photo gallery, about, menus & packages, ratings & reviews, and a booking panel with live pricing (date, guest count, package, dietary requirements).
- `404.html` — not-found page.

## Project structure

```
caterus/
├── index.html      # Landing page
├── caterer.html    # Single caterer detail page
├── 404.html        # Not-found page
├── styles.css      # Styles — design tokens and all components
├── script.js       # Interactions — nav, smooth scroll, carousel, modals, booking
└── assets/         # Images and media
    └── avatars/    # Reviewer avatar photos
```

## Running locally

This is a static site. Open `index.html` directly in a browser, or serve it:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.
