-- ============================================================
-- Caterus — Seed Data
-- Import into your database via phpMyAdmin after schema.sql
-- ============================================================

-- ── Admin ──
INSERT INTO admins (email, password_hash, name, role) VALUES
('admin@caterus.com.au', '$2a$12$LJ3m4ys3Rl8MHxvo3.GFOO8gMDZfPGKBRXkGhKdDuQxBtBpFxGe.i', 'Admin', 'super_admin');

-- ── Caterers ──
INSERT INTO caterers (slug, business_name, tagline, description, cuisine_type, suburb, city, postcode, state, contact_name, contact_email, contact_phone, abn, price_from, min_guests, max_guests, min_notice_days, response_time, featured_image, is_published, is_featured, rating_avg, review_count, status) VALUES
('harbour-table-co', 'Harbour Table Co.', 'Premium modern Australian cuisine with seasonal Victorian produce.', 'Founded in 2015 by chef Marcus Hale, Harbour Table Co. brings restaurant-grade plating and seasonal Victorian produce to events of every size. The team has catered everything from boardroom lunches to 800-guest gala dinners at Melbourne''s landmark venues.\n\nEvery menu is built with you - we work to your theme, dietary needs and budget, then handle delivery, setup, service staff and pack-down so your day runs without a hitch.', 'Modern Australian', 'Southbank', 'Melbourne', '3006', 'VIC', 'Marcus Hale', 'hello@harbourtable.com.au', '0412 345 678', '12345678901', 35.00, 20, 1000, 7, '~2 hours', 'assets/food2.png', TRUE, TRUE, 5.00, 142, 'active'),

('olive-vine-catering', 'Olive & Vine Catering', 'Authentic Mediterranean sharing plates, grazing boards and mezze spreads.', 'Olive & Vine brings the warmth of Mediterranean cuisine to your event with beautiful grazing boards, mezze spreads, and share-style dining. The centrepiece of any wedding or celebration.', 'Mediterranean', 'Fitzroy', 'Melbourne', '3065', 'VIC', 'Sofia Papadopoulos', 'hello@oliveandvine.com.au', '0423 456 789', '23456789012', 22.00, 20, 500, 7, '~3 hours', 'assets/food1.png', TRUE, FALSE, 4.90, 86, 'active'),

('east-west-kitchen', 'East & West Kitchen', 'Bold Asian-inspired flavours with a modern Australian twist.', 'Bold Asian-inspired flavours with a modern Australian twist. Dumplings, bao, share plates and canape selections for any occasion.', 'Asian Fusion', 'Richmond', 'Melbourne', '3121', 'VIC', 'David Chen', 'hello@eastwestkitchen.com.au', '0434 567 890', '34567890123', 28.00, 20, 300, 5, '~2 hours', 'assets/food4.png', TRUE, FALSE, 4.80, 67, 'active'),

('art-of-feast', 'Art of Feast', 'Michelin-trained chef delivering restaurant-quality fine dining to your event.', 'Michelin-trained chef delivering restaurant-quality fine dining to your event. Bespoke menus and immaculate presentation.', 'Fine Dining', 'Toorak', 'Melbourne', '3142', 'VIC', 'James Laurent', 'hello@artoffeast.com.au', '0445 678 901', '45678901234', 55.00, 10, 150, 14, '~4 hours', 'assets/food3.png', TRUE, FALSE, 4.90, 54, 'active'),

('la-cucina-collective', 'La Cucina Collective', 'Authentic Italian family recipes for your event.', 'Authentic Italian family recipes for your event. Handmade pasta, wood-fired pizza, antipasto platters, and heavenly tiramisu.', 'Italian', 'Carlton', 'Melbourne', '3053', 'VIC', 'Maria Rossi', 'hello@lacucinacollective.com.au', '0456 789 012', '56789012345', 25.00, 20, 400, 7, '~3 hours', 'assets/hero_main.png', TRUE, FALSE, 4.70, 93, 'active'),

('smoke-ember', 'Smoke & Ember', 'Low-and-slow BBQ experts.', 'Low-and-slow BBQ experts. Slow-smoked brisket, ribs, pulled pork and all the fixings for outdoor events and team days.', 'BBQ & Grill', 'Brunswick', 'Melbourne', '3056', 'VIC', 'Tom Mitchell', 'hello@smokeandember.com.au', '0467 890 123', '67890123456', 18.00, 20, 600, 5, '~2 hours', 'assets/corporate.png', TRUE, FALSE, 4.80, 112, 'active');

-- ── Caterer Tags ──
INSERT INTO caterer_tags (caterer_id, tag) VALUES
(1, 'Modern Australian'), (1, 'Corporate'), (1, 'Up to 1000'),
(2, 'Mediterranean'), (2, 'Weddings'), (2, 'Up to 500'),
(3, 'Asian Fusion'), (3, 'Parties'), (3, 'Up to 300'),
(4, 'Fine Dining'), (4, 'Private Events'), (4, 'Up to 150'),
(5, 'Italian'), (5, 'Family Style'), (5, 'Up to 400'),
(6, 'BBQ & Grill'), (6, 'Outdoor Events'), (6, 'Up to 600');

-- ── Caterer Occasions ──
INSERT INTO caterer_occasions (caterer_id, occasion) VALUES
(1, 'corporate'), (1, 'wedding'),
(2, 'wedding'), (2, 'party'),
(3, 'asian'), (3, 'party'), (3, 'corporate'),
(4, 'corporate'), (4, 'party'),
(5, 'italian'), (5, 'party'), (5, 'corporate'),
(6, 'bbq'), (6, 'party'), (6, 'corporate');

-- ── Specialties (Harbour Table) ──
INSERT INTO caterer_specialties (caterer_id, specialty) VALUES
(1, 'Seasonal degustation'), (1, 'Grazing & share tables'), (1, 'Canapé receptions'), (1, 'Plated banquets'), (1, 'Barista & bar service');

-- ── Inclusions (Harbour Table) ──
INSERT INTO caterer_inclusions (caterer_id, title, description, sort_order) VALUES
(1, 'Professional service staff', 'Uniformed waiters and a floor manager for the duration of your event.', 1),
(1, 'Delivery, setup & pack-down', 'We arrive early, style the table and clean up after - included in every quote.', 2),
(1, 'Crockery & linen', 'Plates, cutlery, glassware and table linen available on request.', 3),
(1, 'Dietary accommodation', 'Vegetarian, vegan, gluten-free, halal and allergen-aware options across the menu.', 4);

-- ── Menus (Harbour Table) ──
INSERT INTO menus (caterer_id, name, slug, description, price_per_head, is_featured, sort_order) VALUES
(1, 'Canapé Reception', 'canape', '6 roaming canapés + 2 substantial bites. Perfect for cocktail-style events and launches.', 35.00, FALSE, 1),
(1, 'Grazing Table', 'grazing', 'Abundant share-style grazing with seasonal produce, cured meats, cheeses and dips.', 42.00, TRUE, 2),
(1, 'Seated Banquet', 'banquet', 'Three-course plated dinner with alternating mains and shared sides.', 65.00, FALSE, 3);

-- ── Menu Items ──
INSERT INTO menu_items (menu_id, name, is_vegetarian, sort_order) VALUES
(1, 'Seared scallop, pea, pancetta', FALSE, 1),
(1, 'Confit duck bao', FALSE, 2),
(1, 'Heirloom tomato tartlet', TRUE, 3),
(1, 'Mini wagyu sliders', FALSE, 4),
(2, 'Victorian cheese selection', TRUE, 1),
(2, 'House-cured charcuterie', FALSE, 2),
(2, 'Wood-fired flatbreads', TRUE, 3),
(2, 'Seasonal antipasti & dips', TRUE, 4),
(3, 'Entrée, main & dessert', FALSE, 1),
(3, 'Shared seasonal sides', TRUE, 2),
(3, 'Freshly baked sourdough', TRUE, 3),
(3, 'Tea, coffee & petit fours', TRUE, 4);

-- ── Vetting (Harbour Table) ──
INSERT INTO vetting_checklists (caterer_id, food_safety_cert, food_safety_expiry, public_liability, liability_amount, liability_expiry, abn_verified, quality_check, quality_notes, approved_by, approved_at) VALUES
(1, TRUE, '2027-06-30', TRUE, '$20M', '2027-03-15', TRUE, TRUE, 'Exceptional quality. Consistent high ratings across all events.', 1, NOW());

-- ── Reviews (Harbour Table) ──
INSERT INTO reviews (caterer_id, reviewer_name, reviewer_initials, event_type, event_date, rating, comment, status) VALUES
(1, 'Sarah Robertson', 'SR', 'Corporate lunch', 'Mar 2026', 5, 'Booked Harbour Table for our 80-person company lunch. Professional, punctual and the food was genuinely restaurant quality. Half the office asked who catered it.', 'approved'),
(1, 'Marcus Kowalski', 'MK', 'Product launch', 'Feb 2026', 5, 'The grazing table was the centrepiece of our launch - guests couldn''t stop photographing it. Setup was seamless and the team handled a last-minute headcount change without fuss.', 'approved'),
(1, 'Jessica & Paul Tran', 'JT', 'Wedding', 'Jan 2026', 5, 'Catered our 150-guest wedding and exceeded every expectation. Dietary requirements for 20+ guests were handled perfectly. Worth every dollar.', 'approved');

-- ── Settings ──
INSERT INTO settings (setting_key, setting_value, setting_group) VALUES
('smtp_host', '', 'smtp'),
('smtp_port', '587', 'smtp'),
('smtp_user', '', 'smtp'),
('smtp_pass', '', 'smtp'),
('smtp_from_email', 'hello@caterus.com.au', 'smtp'),
('smtp_from_name', 'Caterus', 'smtp'),
('stripe_publishable_key', '', 'stripe'),
('stripe_secret_key', '', 'stripe'),
('stripe_webhook_secret', '', 'stripe'),
('commission_rate', '12', 'general'),
('gst_rate', '10', 'general'),
('site_name', 'Caterus', 'general'),
('site_tagline', 'Australia''s catering marketplace', 'general');
