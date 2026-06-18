-- ============================================================
-- Caterus Bulk Test Data Seed
-- ============================================================
-- Run this AFTER using the "Erase Test Data" button in Settings.
-- That button truncates all customer/booking/review tables first.
-- This file inserts 10 caterers, menus, bookings, reviews,
-- enquiries, applications, and payouts.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ──────────────────────────────────────────────────────────────
-- CATERERS (10)
-- ──────────────────────────────────────────────────────────────
INSERT INTO caterers
  (id, slug, business_name, tagline, description, cuisine_type, suburb, city, postcode, state,
   contact_name, contact_email, contact_phone, abn,
   price_from, min_guests, max_guests, min_notice_days, response_time,
   featured_image, is_published, is_featured, is_promoted, status,
   rating_avg, review_count)
VALUES
(1, 'spice-route-indian-cuisine', 'Spice Route Indian Cuisine',
 'Authentic flavours from the subcontinent',
 'Spice Route brings the vibrant street food traditions of India to Melbourne events. From aromatic biryanis to freshly made dosas, our team of experienced chefs use traditional spice blends and locally sourced produce to create unforgettable dining experiences for corporate lunches, weddings, and private celebrations.',
 'Indian', 'Carlton', 'Melbourne', '3053', 'VIC',
 'Priya Sharma', 'priya@spiceroute.com.au', '+61 3 9347 2211', '51 234 567 890',
 45.00, 30, 400, 7, '~2 hours',
 'assets/uploads/2026/06/caterer-1-featured.webp', 1, 1, 1, 'active', 4.80, 12),

(2, 'graze-and-glory', 'Graze & Glory',
 'Modern Australian grazing tables and canapés',
 'Graze & Glory specialises in spectacular grazing tables and roaming canapés that bring Melbourne''s best produce to your event. Our aesthetic-forward style is perfect for corporate cocktail parties, engagement parties, product launches, and any occasion where food should be the centrepiece.',
 'Modern Australian', 'South Yarra', 'Melbourne', '3141', 'VIC',
 'Marcus Webb', 'hello@grazeandglory.com.au', '+61 412 345 678', '62 345 678 901',
 55.00, 20, 300, 10, '~3 hours',
 'assets/uploads/2026/06/caterer-2-featured.webp', 1, 1, 0, 'active', 4.70, 9),

(3, 'harbour-kitchen-catering', 'Harbour Kitchen',
 'Premium seafood catering for discerning palates',
 'Harbour Kitchen brings the finest sustainably sourced seafood from Victoria''s coastline to your event. Our whole-fish barbecues, fresh oyster stations, and stunning seafood towers create a memorable centrepiece for gala dinners, waterfront events, and special celebrations.',
 'Seafood', 'Docklands', 'Melbourne', '3008', 'VIC',
 'James Caldwell', 'james@harbourkitchen.com.au', '+61 3 9670 4400', '73 456 789 012',
 75.00, 40, 500, 14, '~4 hours',
 'assets/uploads/2026/06/caterer-3-featured.webp', 1, 0, 0, 'active', 4.60, 7),

(4, 'green-table-co', 'Green Table Co.',
 'Plant-based catering that surprises and delights',
 'Green Table Co. proves that plant-based food can be the star of any event. We create vibrant, nutritionally balanced menus using organic and biodynamic produce from our network of Victorian farms. Perfect for health-conscious corporate clients, eco-friendly weddings, and progressive brands.',
 'Vegan', 'Fitzroy', 'Melbourne', '3065', 'VIC',
 'Ava Chen', 'ava@greentableco.com.au', '+61 403 567 890', '84 567 890 123',
 50.00, 20, 250, 7, '~2 hours',
 'assets/uploads/2026/06/caterer-4-featured.webp', 1, 0, 1, 'active', 4.90, 15),

(5, 'casa-bella-catering', 'Casa Bella Catering',
 'La cucina italiana nel cuore di Melbourne',
 'Casa Bella brings the warmth and generosity of Italian family cooking to Melbourne events. Our handmade pastas, wood-fired roasts, and traditional antipasto spreads transport your guests to the heart of Tuscany. Perfect for weddings, milestone birthdays, and corporate dinners.',
 'Italian', 'Richmond', 'Melbourne', '3121', 'VIC',
 'Marco Ricci', 'marco@casabellacatering.com.au', '+61 3 9428 1155', '95 678 901 234',
 60.00, 30, 350, 10, '~2 hours',
 'assets/uploads/2026/06/caterer-5-featured.webp', 1, 0, 0, 'active', 4.50, 8),

(6, 'the-noodle-bar-collective', 'The Noodle Bar Collective',
 'Asian street food, elevated for the Melbourne crowd',
 'The Noodle Bar Collective draws inspiration from the street food stalls of Bangkok, Hanoi, Tokyo, and Hong Kong. Our live noodle stations, baos, and shared plates bring an energetic, interactive dining experience to festivals, office parties, and social events across Greater Melbourne.',
 'Asian Fusion', 'CBD', 'Melbourne', '3000', 'VIC',
 'Li Wei Zhang', 'bookings@noodlebarcollective.com.au', '+61 421 789 012', '11 789 012 345',
 40.00, 50, 600, 5, '~1 hour',
 'assets/uploads/2026/06/caterer-6-featured.webp', 1, 0, 1, 'active', 4.40, 11),

(7, 'outback-feast', 'Outback Feast',
 'Australian BBQ catering done properly',
 'Outback Feast brings the great Australian barbecue tradition to events across Melbourne. Low-and-slow smoked meats, fresh salads, and damper rolls make our spreads irresistible. Whether it''s a backyard party, school fete, or large corporate picnic, we deliver that authentic outdoor Australian dining experience.',
 'BBQ', 'Abbotsford', 'Melbourne', '3067', 'VIC',
 'Brett Lawson', 'brett@outbackfeast.com.au', '+61 415 901 234', '22 890 123 456',
 38.00, 40, 500, 7, '~3 hours',
 'assets/uploads/2026/06/caterer-7-featured.webp', 1, 0, 0, 'active', 4.30, 6),

(8, 'la-petite-bouchee', 'La Petite Bouchee',
 'French fine-dining catering for exceptional occasions',
 'La Petite Bouchee offers the pinnacle of French culinary tradition for Melbourne''s most discerning events. Our team of classically trained chefs curate multi-course degustation experiences, elegant canapé receptions, and intimate dinner parties using premium French-inspired ingredients. Available for black-tie galas, corporate retreats, and luxury private events.',
 'French', 'Toorak', 'Melbourne', '3142', 'VIC',
 'Isabelle Fontaine', 'isabelle@lapetitebouchee.com.au', '+61 3 9827 3300', '33 901 234 567',
 110.00, 20, 200, 21, '~6 hours',
 'assets/uploads/2026/06/caterer-8-featured.webp', 1, 1, 1, 'active', 4.95, 18),

(9, 'sushi-matsuri', 'Sushi Matsuri',
 'Authentic Japanese catering by Tokyo-trained chefs',
 'Sushi Matsuri''s Tokyo-trained sushi chefs bring the art of Japanese cuisine to Melbourne events. Our hand-rolled sushi platters, teppanyaki stations, and yakitori skewers deliver an authentic Japanese experience. Popular with tech companies, design studios, and anyone looking for fresh, healthy, and visually stunning catering.',
 'Japanese', 'South Melbourne', 'Melbourne', '3205', 'VIC',
 'Kenji Tanaka', 'kenji@sushimatsuri.com.au', '+61 3 9699 7700', '44 012 345 678',
 65.00, 25, 300, 10, '~2 hours',
 'assets/uploads/2026/06/caterer-9-featured.webp', 1, 0, 0, 'active', 4.75, 10),

(10, 'meze-and-more', 'Meze & More',
 'Greek and Mediterranean sharing feasts',
 'Meze & More celebrates the convivial spirit of Greek and Mediterranean dining. Abundant sharing platters of dips, grilled meats, fresh salads, and spanakopita create a warm, social atmosphere at any event. Our lamb on the spit is the centrepiece of many Melbourne weddings and festivals, and our vegetarian spreads are equally impressive.',
 'Mediterranean', 'Prahran', 'Melbourne', '3181', 'VIC',
 'Eleni Papadopoulos', 'eleni@mezeandmore.com.au', '+61 408 234 567', '55 123 456 789',
 48.00, 30, 450, 7, '~2 hours',
 'assets/uploads/2026/06/caterer-10-featured.webp', 1, 0, 0, 'active', 4.65, 13);

-- ──────────────────────────────────────────────────────────────
-- CATERER TAGS
-- ──────────────────────────────────────────────────────────────
INSERT INTO caterer_tags (caterer_id, tag) VALUES
(1,'Indian'),(1,'Halal'),(1,'Vegan Options'),(1,'Spicy'),
(2,'Grazing'),(2,'Canapés'),(2,'Modern Australian'),(2,'Gluten Free Options'),
(3,'Seafood'),(3,'Sustainable'),(3,'Gourmet'),(3,'Oyster Bar'),
(4,'Vegan'),(4,'Organic'),(4,'Gluten Free'),(4,'Plant Based'),
(5,'Italian'),(5,'Pasta'),(5,'Wood Fired'),(5,'Traditional'),
(6,'Asian Fusion'),(6,'Street Food'),(6,'Noodles'),(6,'Interactive'),
(7,'BBQ'),(7,'Australian'),(7,'Smoked Meats'),(7,'Outdoor'),
(8,'French'),(8,'Fine Dining'),(8,'Degustation'),(8,'Luxury'),
(9,'Japanese'),(9,'Sushi'),(9,'Teppanyaki'),(9,'Healthy'),
(10,'Greek'),(10,'Mediterranean'),(10,'Sharing Plates'),(10,'Lamb Spit');

-- ──────────────────────────────────────────────────────────────
-- CATERER OCCASIONS
-- ──────────────────────────────────────────────────────────────
INSERT INTO caterer_occasions (caterer_id, occasion) VALUES
(1,'Corporate'),(1,'Wedding'),(1,'Birthday'),(1,'Festival'),
(2,'Corporate'),(2,'Cocktail Party'),(2,'Product Launch'),(2,'Engagement'),
(3,'Corporate Gala'),(3,'Wedding'),(3,'Conference'),(3,'Birthday'),
(4,'Corporate'),(4,'Wedding'),(4,'Conference'),(4,'Festival'),
(5,'Wedding'),(5,'Birthday'),(5,'Corporate Dinner'),(5,'Engagement'),
(6,'Corporate'),(6,'Festival'),(6,'Birthday'),(6,'Staff Party'),
(7,'Corporate'),(7,'School Fete'),(7,'Outdoor Festival'),(7,'Birthday'),
(8,'Corporate Gala'),(8,'Wedding'),(8,'Private Dinner'),(8,'Charity Event'),
(9,'Corporate'),(9,'Product Launch'),(9,'Cocktail Party'),(9,'Birthday'),
(10,'Wedding'),(10,'Festival'),(10,'Corporate'),(10,'Birthday');

-- ──────────────────────────────────────────────────────────────
-- CATERER SPECIALTIES
-- ──────────────────────────────────────────────────────────────
INSERT INTO caterer_specialties (caterer_id, specialty) VALUES
(1,'Biryani Station'),(1,'Live Dosa Station'),(1,'Chaat Platters'),
(2,'Grazing Tables'),(2,'Roaming Canapés'),(2,'Cheese & Charcuterie'),
(3,'Whole Fish BBQ'),(3,'Oyster Shucking Station'),(3,'Seafood Tower'),
(4,'Raw Food Platters'),(4,'Live Bowl Station'),(4,'Vegan Desserts'),
(5,'Handmade Pasta Station'),(5,'Wood-Fired Porchetta'),(5,'Antipasto Spreads'),
(6,'Live Ramen Station'),(6,'Steamed Bao Bar'),(6,'Yakitori Grill'),
(7,'Low & Slow Smoked Brisket'),(7,'Lamb Shoulder'),(7,'Loaded Rolls'),
(8,'Canapé Reception'),(8,'5-Course Degustation'),(8,'Cheese Trolley'),
(9,'Nigiri & Maki Platters'),(9,'Live Teppanyaki'),(9,'Yakitori Station'),
(10,'Lamb on the Spit'),(10,'Mezze Spreads'),(10,'Spanakopita & Pastries');

-- ──────────────────────────────────────────────────────────────
-- CATERER INCLUSIONS
-- ──────────────────────────────────────────────────────────────
INSERT INTO caterer_inclusions (caterer_id, title, description, sort_order) VALUES
(1,'Setup & Packdown','Full setup and packdown of catering equipment included',1),
(1,'Serving Staff','Minimum 1 chef + 2 serving staff for all bookings',2),
(1,'Biodegradable Plates','Eco-friendly disposable tableware provided',3),

(2,'Styling & Props','Grazing boards styled with fresh garnishes, flowers, and props',1),
(2,'Serving Staff','2-4 roaming staff depending on guest count',2),
(2,'Dietary Labels','All items labelled for common allergens',3),

(3,'Ice & Display','Seafood towers presented on crushed ice with full display props',1),
(3,'Chef & Staff','Head chef plus 2 assistants for all events',2),
(3,'Condiments','Full range of condiments, sauces, and lemon service',3),

(4,'Compostable Packaging','100% compostable serviceware at all events',1),
(4,'Nutritional Info','Detailed nutritional cards available on request',2),
(4,'Staff','1 chef + 1 server per 50 guests',3),

(5,'Linen-Covered Tables','White-linen buffet tables included for all events',1),
(5,'Serving Staff','2 experienced food service staff per 50 guests',2),
(5,'Parmesan Wheel','Freshly grated parmigiano reggiano wheel included in all pasta menus',3),

(6,'Portable Kitchen','Fully self-contained portable kitchen for any venue',1),
(6,'Staff','2 chefs + 2 servers for standard bookings',2),
(6,'Custom Signage','Branded menu signage for live stations',3),

(7,'BBQ Equipment','All commercial BBQ equipment supplied and operated by us',1),
(7,'Trestle Tables','Serving tables and utensils included',2),
(7,'Staff','Pitmaster + 2 servers for standard events',3),

(8,'Fine China','White porcelain tableware and linen napkins provided',1),
(8,'Sommelier Pairing','Wine pairing recommendations with every multi-course menu',2),
(8,'Dedicated Event Coordinator','Personal coordinator from booking to event day',3),

(9,'Sushi Grade Fish','Only sushi-grade fish sourced from certified Melbourne suppliers',1),
(9,'Sake Service','Sake and Japanese tea service available as add-on',2),
(9,'Staff','Head sushi chef + 2 servers for all events',3),

(10,'Traditional Spreads','Handmade dips including tzatziki, hummus, and taramasalata',1),
(10,'Serving Staff','2 chefs + 2 servers for standard events',2),
(10,'Lemon & Herb Garnish','Fresh lemon, herbs, and olive oil dressing service',3);

-- ──────────────────────────────────────────────────────────────
-- VETTING CHECKLISTS
-- ──────────────────────────────────────────────────────────────
INSERT INTO vetting_checklists
  (caterer_id, food_safety_cert, food_safety_expiry, public_liability, liability_amount, liability_expiry, abn_verified, quality_check, quality_notes, approved_at)
VALUES
(1, 1, '2027-03-15', 1, '$20M', '2027-01-31', 1, 1, 'Visited kitchen March 2025. Impeccable hygiene standards, HACCP plan in place.',   '2025-03-20 10:00:00'),
(2, 1, '2026-11-30', 1, '$20M', '2026-11-30', 1, 1, 'Quality tasting done April 2025. Outstanding produce sourcing and presentation.',     '2025-04-10 14:30:00'),
(3, 1, '2027-06-30', 1, '$20M', '2027-06-30', 1, 1, 'Seafood licences verified. Cold chain management excellent.',                          '2025-05-02 09:15:00'),
(4, 1, '2027-04-30', 1, '$10M', '2027-04-30', 1, 1, 'All organic certifications sighted. Allergen management is top-notch.',               '2025-04-22 11:00:00'),
(5, 1, '2027-02-28', 1, '$20M', '2027-02-28', 1, 1, 'Traditional Italian background verified. Commercial kitchen inspected and approved.',  '2025-03-05 13:00:00'),
(6, 1, '2026-12-31', 1, '$20M', '2026-12-31', 1, 1, 'Portable kitchen setup inspected. Great food safety culture.',                        '2025-04-18 10:45:00'),
(7, 1, '2026-10-31', 1, '$10M', '2026-10-31', 1, 1, 'BBQ equipment food-safe. Pitmaster has 12 years experience.',                         '2025-04-01 09:00:00'),
(8, 1, '2027-08-31', 1, '$20M', '2027-08-31', 1, 1, 'Exceptional fine dining credentials. French-trained chef verified. No issues.',       '2025-03-28 15:00:00'),
(9, 1, '2027-05-31', 1, '$20M', '2027-05-31', 1, 1, 'Sushi-grade fish sourcing audited. Tokyo culinary certificate verified.',              '2025-05-10 11:30:00'),
(10,1, '2027-01-31', 1, '$10M', '2027-01-31', 1, 1, 'Greek family-owned business since 2009. Lamb spit licence current for VIC.',           '2025-03-15 14:00:00');

-- ──────────────────────────────────────────────────────────────
-- CATERER IMAGES (gallery)
-- ──────────────────────────────────────────────────────────────
INSERT INTO caterer_images (caterer_id, image_path, alt_text, sort_order) VALUES
(1,'assets/uploads/2026/06/caterer-1-gallery-1.webp','Spice Route biryani spread',1),
(1,'assets/uploads/2026/06/caterer-1-gallery-2.webp','Live dosa station at event',2),
(2,'assets/uploads/2026/06/caterer-2-gallery-1.webp','Graze & Glory grazing table',1),
(2,'assets/uploads/2026/06/caterer-2-gallery-2.webp','Roaming canapés at launch',2),
(3,'assets/uploads/2026/06/caterer-3-gallery-1.webp','Harbour Kitchen seafood tower',1),
(3,'assets/uploads/2026/06/caterer-3-gallery-2.webp','Oyster shucking station',2),
(4,'assets/uploads/2026/06/caterer-4-gallery-1.webp','Green Table vegan spread',1),
(5,'assets/uploads/2026/06/caterer-5-gallery-1.webp','Casa Bella pasta station',1),
(5,'assets/uploads/2026/06/caterer-5-gallery-2.webp','Wood-fired porchetta',2),
(6,'assets/uploads/2026/06/caterer-6-gallery-1.webp','Noodle Bar live ramen station',1),
(7,'assets/uploads/2026/06/caterer-7-gallery-1.webp','Outback Feast smoked brisket',1),
(7,'assets/uploads/2026/06/caterer-7-gallery-2.webp','BBQ setup at outdoor event',2),
(8,'assets/uploads/2026/06/caterer-8-gallery-1.webp','La Petite Bouchee canapé platter',1),
(8,'assets/uploads/2026/06/caterer-8-gallery-2.webp','Degustation table setting',2),
(9,'assets/uploads/2026/06/caterer-9-gallery-1.webp','Sushi Matsuri platter spread',1),
(10,'assets/uploads/2026/06/caterer-10-gallery-1.webp','Meze & More lamb on the spit',1),
(10,'assets/uploads/2026/06/caterer-10-gallery-2.webp','Greek meze spread',2);

-- ──────────────────────────────────────────────────────────────
-- MENUS
-- ──────────────────────────────────────────────────────────────
INSERT INTO menus (id, caterer_id, name, slug, description, price_per_head, is_featured, is_active) VALUES
-- Spice Route
(1,  1, 'Street Food Feast',   'street-food-feast',   'A vibrant spread of Indian street snacks, chaat, and starters perfect for cocktail-style events.', 45.00, 1, 1),
(2,  1, 'Grand Biryani Banquet','grand-biryani-banquet','Fragrant biryanis (chicken, lamb, vegetable), curries, naan, raita, and chutneys for a full seated meal.', 65.00, 0, 1),
-- Graze & Glory
(3,  2, 'Classic Graze',       'classic-graze',       'Artisan cheese, cured meats, seasonal fruits, crackers, dips, and fresh garnishes on a styled board.', 55.00, 1, 1),
(4,  2, 'Roaming Canapés',     'roaming-canapes',     '8 varieties of hot and cold canapés served by roaming staff for 2 hours.', 60.00, 0, 1),
-- Harbour Kitchen
(5,  3, 'Seafood Cocktail Party','seafood-cocktail-party','Fresh oysters, prawns, smoked salmon, crab cakes, and ocean trout rillette.', 75.00, 1, 1),
(6,  3, 'Whole Fish BBQ',      'whole-fish-bbq',       'Whole snapper and barramundi cooked over charcoal with Mediterranean herbs, served with salads and sides.', 85.00, 0, 1),
-- Green Table
(7,  4, 'The Garden Feast',    'the-garden-feast',    'A seasonal plant-based spread: roasted vegetable platters, grain salads, dips, and house-made flatbreads.', 50.00, 1, 1),
(8,  4, 'Raw & Vital',         'raw-and-vital',       'Cold-pressed juices, raw nori rolls, activated nut cheeses, fruit platters, and energy bliss balls.', 55.00, 0, 1),
-- Casa Bella
(9,  5, 'La Festa Italiana',   'la-festa-italiana',   'Antipasto, handmade tagliatelle with three sauces, wood-fired porchetta, tiramisu.', 65.00, 1, 1),
(10, 5, 'Aperitivo Hour',      'aperitivo-hour',      'Bruschetta, arancini, prosciutto e melone, olives, and Italian-style nibbles for cocktail events.', 52.00, 0, 1),
-- Noodle Bar Collective
(11, 6, 'Street Market Package','street-market-package','Live ramen and noodle stations, steamed bao, gyoza, and rice dishes.', 45.00, 1, 1),
(12, 6, 'Pan-Asian Banquet',   'pan-asian-banquet',   'Shared plates: spring rolls, satay skewers, pad thai, fried rice, curry, and dessert.', 55.00, 0, 1),
-- Outback Feast
(13, 7, 'The Classic Aussie BBQ','classic-aussie-bbq','Smoked brisket, pork ribs, sausages, corn on the cob, coleslaw, damper rolls.', 45.00, 1, 1),
(14, 7, 'Slow & Low Feast',    'slow-and-low-feast',  'Overnight-smoked whole lamb shoulder, potato bake, garden salads, and house BBQ sauces.', 55.00, 0, 1),
-- La Petite Bouchee
(15, 8, 'Canapé Prestige',     'canape-prestige',     '12 varieties of French-style cold and hot canapés with champagne service recommendations.', 110.00, 1, 1),
(16, 8, '5-Course Degustation','5-course-degustation','Amuse-bouche, entrée, fish, main, dessert with wine pairing suggestions. White-glove service.', 175.00, 0, 1),
-- Sushi Matsuri
(17, 9, 'Sushi Platter Package','sushi-platter-package','Mixed nigiri, maki rolls, and hand rolls with soy, pickled ginger, and wasabi.', 65.00, 1, 1),
(18, 9, 'Teppanyaki Experience','teppanyaki-experience','Live teppanyaki station: wagyu beef, chicken, prawns, yakisoba noodles, fried rice.', 85.00, 0, 1),
-- Meze & More
(19,10, 'The Full Meze',       'the-full-meze',       'Dips, dolmades, spanakopita, grilled halloumi, lamb skewers, Greek salad, fresh pita.', 52.00, 1, 1),
(20,10, 'Lamb on the Spit',    'lamb-on-the-spit',    'Whole lamb rotisserie spit-roasted on site. Served with tzatziki, pita, salads, and roast potatoes.', 65.00, 0, 1);

-- ──────────────────────────────────────────────────────────────
-- MENU ITEMS
-- ──────────────────────────────────────────────────────────────
INSERT INTO menu_items (menu_id, name, is_vegetarian, sort_order) VALUES
-- Menu 1: Street Food Feast
(1,'Samosa Chaat',1,1),(1,'Pani Puri Station',1,2),(1,'Seekh Kebab',0,3),(1,'Pakora Platter',1,4),(1,'Mango Lassi',1,5),
-- Menu 2: Grand Biryani Banquet
(2,'Chicken Biryani',0,1),(2,'Lamb Biryani',0,2),(2,'Vegetable Biryani',1,3),(2,'Butter Chicken',0,4),(2,'Dal Makhani',1,5),(2,'Garlic Naan',1,6),(2,'Raita & Chutneys',1,7),
-- Menu 3: Classic Graze
(3,'Artisan Cheese Selection',1,1),(3,'Cured Meats & Prosciutto',0,2),(3,'Seasonal Fruits',1,3),(3,'Crackers & Sourdough',1,4),(3,'Dips (Hummus, Baba Ganoush)',1,5),
-- Menu 4: Roaming Canapés
(4,'Smoked Salmon Blini',0,1),(4,'Beef Tartare Crostini',0,2),(4,'Mushroom & Brie Vol-au-Vent',1,3),(4,'Prawn Cocktail Shooter',0,4),(4,'Caprese Skewer',1,5),
-- Menu 5: Seafood Cocktail Party
(5,'Pacific Oysters',0,1),(5,'Chilled Tiger Prawns',0,2),(5,'Smoked Salmon with Crème Fraîche',0,3),(5,'Crab Cakes',0,4),(5,'Ocean Trout Rillette',0,5),
-- Menu 7: Garden Feast
(7,'Roasted Seasonal Vegetables',1,1),(7,'Warm Grain Salad',1,2),(7,'Hummus & Baba Ganoush',1,3),(7,'House-made Flatbreads',1,4),(7,'Marinated Olives',1,5),
-- Menu 9: La Festa Italiana
(9,'Antipasto Misto',0,1),(9,'Tagliatelle al Ragù',0,2),(9,'Pappardelle al Pesto',1,3),(9,'Wood-Fired Porchetta',0,4),(9,'Tiramisu',1,5),
-- Menu 13: Classic Aussie BBQ
(13,'Smoked Brisket',0,1),(13,'Pork Ribs',0,2),(13,'Beef & Pork Sausages',0,3),(13,'Corn on the Cob',1,4),(13,'Classic Coleslaw',1,5),(13,'Damper Rolls',1,6),
-- Menu 15: Canapé Prestige
(15,'Foie Gras on Brioche Toast',0,1),(15,'Smoked Duck with Cherry Gel',0,2),(15,'Gruyère Gougères',1,3),(15,'Wagyu Beef Tartare',0,4),(15,'Crème Brûlée Tart',1,5),
-- Menu 17: Sushi Platter Package
(17,'Mixed Nigiri (8 types)',0,1),(17,'California Rolls',0,2),(17,'Spicy Tuna Maki',0,3),(17,'Avocado & Cucumber Rolls',1,4),(17,'Edamame',1,5),
-- Menu 19: Full Meze
(19,'Tzatziki, Hummus, Taramasalata',1,1),(19,'Dolmades',1,2),(19,'Spanakopita',1,3),(19,'Grilled Halloumi',1,4),(19,'Lamb Souvlaki Skewers',0,5),(19,'Greek Salad',1,6),(19,'Warm Pita Bread',1,7);

-- ──────────────────────────────────────────────────────────────
-- BOOKINGS (30)
-- ──────────────────────────────────────────────────────────────
INSERT INTO bookings
  (id, reference, caterer_id, menu_id, customer_first_name, customer_last_name,
   customer_email, customer_phone, event_date, guest_count,
   price_per_head, subtotal, gst, total,
   commission_rate, commission_amount, caterer_payout,
   dietary_requirements, special_requests,
   status, payment_status, confirmed_at, completed_at)
VALUES
(1,  'BK-2501-0001', 1, 1, 'Sophie',   'Nguyen',    'sophie.nguyen@email.com',    '0411 111 001', '2026-02-14', 80,  45.00, 3600.00, 360.00, 3960.00, 12.00, 475.20, 3484.80, 'Halal only', 'Set up by 11am', 'completed', 'paid', '2026-01-20 09:00:00', '2026-02-14 20:00:00'),
(2,  'BK-2501-0002', 2, 3, 'Liam',     'Anderson',  'liam.anderson@corp.com.au',  '0412 222 002', '2026-02-20', 60,  55.00, 3300.00, 330.00, 3630.00, 12.00, 435.60, 3194.40, NULL, 'Please include vegan options', 'completed', 'paid', '2026-01-25 14:00:00', '2026-02-20 19:00:00'),
(3,  'BK-2501-0003', 8, 15,'Olivia',   'Martin',    'olivia.martin@luxe.com.au',  '0413 333 003', '2026-03-01', 40,  110.00,4400.00, 440.00, 4840.00, 10.00, 484.00, 4356.00, 'No shellfish', 'Champagne reception at 6pm', 'completed', 'paid', '2026-02-01 10:00:00', '2026-03-01 23:00:00'),
(4,  'BK-2501-0004', 4, 7, 'Noah',     'Thompson',  'noah.t@greentech.com.au',    '0414 444 004', '2026-03-08', 100, 50.00, 5000.00, 500.00, 5500.00, 12.00, 660.00, 4840.00, 'All vegan', 'Label all items clearly', 'completed', 'paid', '2026-02-10 11:00:00', '2026-03-08 18:00:00'),
(5,  'BK-2501-0005', 5, 9, 'Chloe',    'Williams',  'chloe.w@gmail.com',          '0415 555 005', '2026-03-15', 120, 65.00, 7800.00, 780.00, 8580.00, 12.00,1029.60, 7550.40, 'Nut allergy x3', 'Wedding reception, tables for 10', 'completed', 'paid', '2026-02-15 13:00:00', '2026-03-15 22:00:00'),
(6,  'BK-2501-0006', 10,19,'James',    'Brown',     'jbrown@events.com.au',       '0416 666 006', '2026-03-22', 90,  52.00, 4680.00, 468.00, 5148.00, 12.00, 617.76, 4530.24, NULL, 'Greek flag decorations please', 'completed', 'paid', '2026-02-20 09:00:00', '2026-03-22 21:00:00'),
(7,  'BK-2501-0007', 3, 5, 'Emma',     'Jones',     'emma.jones@corporate.net',   '0417 777 007', '2026-04-04', 50,  75.00, 3750.00, 375.00, 4125.00, 12.00, 495.00, 3630.00, 'Shellfish allergy x1', 'Oyster bar as entrance feature', 'completed', 'paid', '2026-03-01 10:00:00', '2026-04-04 20:00:00'),
(8,  'BK-2501-0008', 9, 17,'Isabella', 'Smith',     'isabella.s@design.com.au',   '0418 888 008', '2026-04-10', 45,  65.00, 2925.00, 292.50, 3217.50, 12.00, 386.10, 2831.40, NULL, 'Seated sushi bar layout', 'completed', 'paid', '2026-03-05 11:00:00', '2026-04-10 19:00:00'),
(9,  'BK-2501-0009', 6, 11,'William',  'Taylor',    'william.t@startup.io',       '0419 999 009', '2026-04-18', 200, 45.00, 9000.00, 900.00, 9900.00, 12.00,1188.00, 8712.00, 'Gluten free x8', 'Team of 200 for ANZAC week party', 'completed', 'paid', '2026-03-15 14:00:00', '2026-04-18 21:00:00'),
(10, 'BK-2501-0010', 7, 13,'Charlotte','Davis',     'charlotte.d@school.vic.edu.au','0421 000 010','2026-05-02', 150, 38.00, 5700.00, 570.00, 6270.00, 12.00, 752.40, 5517.60, NULL, 'School fete, early setup needed', 'completed', 'paid', '2026-04-01 09:00:00', '2026-05-02 16:00:00'),

(11, 'BK-2601-0011', 1, 2, 'Mason',    'Wilson',    'mason.w@weddingevent.com',   '0422 111 011', '2026-06-28', 130, 65.00, 8450.00, 845.00, 9295.00, 12.00,1115.40, 8179.60, 'Vegan x5, Gluten Free x3', 'Wedding dinner, 7pm service', 'confirmed', 'paid', '2026-05-20 10:00:00', NULL),
(12, 'BK-2601-0012', 2, 4, 'Ava',      'Moore',     'ava.moore@techconf.com.au',  '0423 222 012', '2026-07-03', 80,  60.00, 4800.00, 480.00, 5280.00, 12.00, 633.60, 4646.40, NULL, 'Canapés for 2 hours then grazing board', 'confirmed', 'paid', '2026-05-25 11:00:00', NULL),
(13, 'BK-2601-0013', 8, 16,'Ethan',    'Jackson',   'ethan.j@luxuryhire.com.au',  '0424 333 013', '2026-07-12', 28,  175.00,4900.00, 490.00, 5390.00, 10.00, 539.00, 4851.00, 'No pork', 'Private birthday degustation, sommelier required', 'confirmed', 'paid', '2026-06-01 09:00:00', NULL),
(14, 'BK-2601-0014', 4, 8, 'Harper',   'Lee',       'harper.lee@wellness.com.au', '0425 444 014', '2026-07-19', 60,  55.00, 3300.00, 330.00, 3630.00, 12.00, 435.60, 3194.40, 'All raw vegan', 'Wellness retreat, no cooking equipment needed', 'confirmed', 'paid', '2026-06-05 13:00:00', NULL),
(15, 'BK-2601-0015', 5, 9, 'Logan',    'Harris',    'logan.harris@realestate.com.au','0426 555 015','2026-07-25', 100, 65.00, 6500.00, 650.00, 7150.00, 12.00, 858.00, 6292.00, 'Nut allergy x2', 'Office launch party', 'confirmed', 'paid', '2026-06-10 14:00:00', NULL),

(16, 'BK-2601-0016', 10,20,'Lucas',    'Clark',     'lucas.clark@greek.net.au',   '0427 666 016', '2026-08-02', 180, 65.00,11700.00,1170.00,12870.00, 12.00,1544.40,11325.60,'No dairy x4', 'Lamb spit for Greek community event', 'confirmed', 'paid', '2026-06-12 10:00:00', NULL),
(17, 'BK-2601-0017', 9, 18,'Mia',      'Lewis',     'mia.lewis@agency.com.au',    '0428 777 017', '2026-08-08', 55,  85.00, 4675.00, 467.50, 5142.50, 12.00, 617.10, 4525.40, NULL, 'Teppanyaki station near main stage', 'confirmed', 'paid', '2026-06-13 11:00:00', NULL),

(18, 'BK-2601-0018', 3, 6, 'Oliver',   'Robinson',  'oliver.r@events.net',        '0429 888 018', '2026-09-05', 70,  85.00, 5950.00, 595.00, 6545.00, 12.00, 785.40, 5759.60, 'Shellfish allergy x3', 'Whole fish BBQ at garden venue', 'pending', 'unpaid', NULL, NULL),
(19, 'BK-2601-0019', 6, 12,'Amelia',   'White',     'amelia.w@studio.com.au',     '0431 999 019', '2026-09-12', 120, 55.00, 6600.00, 660.00, 7260.00, 12.00, 871.20, 6388.80, 'Vegetarian x20', 'Art studio opening night', 'pending', 'unpaid', NULL, NULL),
(20, 'BK-2601-0020', 1, 1, 'Elijah',   'Walker',    'elijah.w@community.org.au',  '0432 000 020', '2026-09-20', 90,  45.00, 4050.00, 405.00, 4455.00, 12.00, 534.60, 3920.40, 'Halal only', 'Community Eid celebration dinner', 'pending', 'unpaid', NULL, NULL),
(21, 'BK-2601-0021', 7, 14,'Scarlett', 'Hall',      'scarlett.h@outdoor.com.au',  '0433 111 021', '2026-10-03', 200, 55.00,11000.00,1100.00,12100.00, 12.00,1452.00,10648.00, NULL, 'Outdoor festival, 4-hour service window', 'pending', 'unpaid', NULL, NULL),
(22, 'BK-2601-0022', 2, 3, 'Aiden',    'Young',     'aiden.y@corp.net.au',        '0434 222 022', '2026-10-10', 50,  55.00, 2750.00, 275.00, 3025.00, 12.00, 363.00, 2662.00, 'Gluten free x5', NULL, 'pending', 'unpaid', NULL, NULL),
(23, 'BK-2601-0023', 8, 15,'Grace',    'King',      'grace.king@charity.org',     '0435 333 023', '2026-10-18', 60,  110.00,6600.00, 660.00, 7260.00, 10.00, 726.00, 6534.00, NULL, 'Charity gala, silent auction tables', 'pending', 'unpaid', NULL, NULL),
(24, 'BK-2601-0024', 9, 17,'Henry',    'Wright',    'henry.w@finance.com.au',     '0436 444 024', '2026-11-07', 35,  65.00, 2275.00, 227.50, 2502.50, 12.00, 300.30, 2202.20, NULL, 'Team lunch, arrange delivery to office', 'pending', 'unpaid', NULL, NULL),
(25, 'BK-2601-0025', 4, 7, 'Lily',     'Scott',     'lily.s@yoga.com.au',         '0437 555 025', '2026-11-15', 40,  50.00, 2000.00, 200.00, 2200.00, 12.00, 264.00, 1936.00, 'All vegan, nut free', 'Yoga retreat lunch, outdoor setting', 'pending', 'unpaid', NULL, NULL),

(26, 'BK-2601-0026', 5, 10,'Jack',     'Green',     'jack.green@marketing.com.au','0438 666 026', '2026-12-05', 75,  52.00, 3900.00, 390.00, 4290.00, 12.00, 514.80, 3775.20, NULL, 'Christmas party aperitivo', 'pending', 'unpaid', NULL, NULL),
(27, 'BK-2601-0027', 10,19,'Victoria', 'Adams',     'victoria.a@law.com.au',      '0439 777 027', '2026-12-12', 55,  52.00, 2860.00, 286.00, 3146.00, 12.00, 377.52, 2768.48, 'Dairy free x3', 'End of year law firm dinner', 'pending', 'unpaid', NULL, NULL),
(28, 'BK-2601-0028', 3, 5, 'Sebastian','Baker',     'seb.baker@media.com.au',     '0441 888 028', '2026-12-19', 80,  75.00, 6000.00, 600.00, 6600.00, 12.00, 792.00, 5808.00, 'Shellfish allergy x2', 'Media company Xmas seafood party', 'pending', 'unpaid', NULL, NULL),
(29, 'BK-2601-0029', 6, 11,'Penelope', 'Nelson',    'pen.nelson@uni.edu.au',      '0442 999 029', '2027-01-22', 300, 40.00,12000.00,1200.00,13200.00, 12.00,1584.00,11616.00, 'Veg x60, GF x20', 'University orientation week', 'pending', 'unpaid', NULL, NULL),
(30, 'BK-2601-0030', 1, 2, 'Daniel',   'Carter',    'daniel.c@wedding.com.au',    '0443 000 030', '2027-02-14', 140, 65.00, 9100.00, 910.00,10010.00, 12.00,1201.20, 8808.80, 'Halal, veg x10, GF x5', 'Valentines Day wedding reception', 'pending', 'unpaid', NULL, NULL);

-- ──────────────────────────────────────────────────────────────
-- REVIEWS (22) - linked to completed bookings 1-10 + extra
-- ──────────────────────────────────────────────────────────────
INSERT INTO reviews
  (caterer_id, booking_id, reviewer_name, reviewer_initials, event_type, event_date, rating, comment, status)
VALUES
(1,  1,  'Sophie Nguyen',    'SN', 'Corporate Lunch',    'Feb 2026', 5, 'Absolutely incredible food! The biryani was fragrant and perfectly spiced. Our guests could not stop talking about it. Will definitely book again for our Eid celebration.', 'approved'),
(2,  2,  'Liam Anderson',    'LA', 'Product Launch',     'Feb 2026', 5, 'Graze & Glory turned our product launch into a visual masterpiece. The grazing table was stunning and the food was fresh and delicious. Highly recommend for any corporate event.', 'approved'),
(8,  3,  'Olivia Martin',    'OM', 'Awards Night',       'Mar 2026', 5, 'La Petite Bouchee raised the bar for fine dining catering. Every canapé was a work of art. Our guests were genuinely impressed and several asked for contact details.', 'approved'),
(4,  4,  'Noah Thompson',    'NT', 'Corporate Lunch',    'Mar 2026', 5, 'As a sustainability-focused company, finding a caterer who shares our values was so important. Green Table Co. delivered beyond expectations - creative, delicious, and zero waste.', 'approved'),
(5,  5,  'Chloe Williams',   'CW', 'Wedding Reception',  'Mar 2026', 4, 'Casa Bella made our wedding dinner so special. The pasta station was a huge hit and the porchetta was incredible. Only minor note: service was slightly slow during peak time.', 'approved'),
(10, 6,  'James Brown',      'JB', 'Community Festival', 'Mar 2026', 5, 'The meze spread and lamb spit were absolutely the talk of our Greek community event. Eleni and her team are consummate professionals. Yiamas!', 'approved'),
(3,  7,  'Emma Jones',       'EJ', 'Corporate Function', 'Apr 2026', 5, 'Harbour Kitchen''s seafood tower was the most impressive catering setup I have ever seen at a corporate event. Fresh, sustainable, and beautifully presented.', 'approved'),
(9,  8,  'Isabella Smith',   'IS', 'Office Party',       'Apr 2026', 5, 'Sushi Matsuri is hands down the best Japanese catering in Melbourne. The sushi was restaurant quality and the presentation was beautiful. Our creative team was over the moon.', 'approved'),
(6,  9,  'William Taylor',   'WT', 'Company Party',      'Apr 2026', 4, 'The Noodle Bar Collective fed 200 of us seamlessly. The live ramen station was a massive hit. Slightly long queue at peak time but overall a great experience.', 'approved'),
(7,  10, 'Charlotte Davis',  'CD', 'School Fete',        'May 2026', 4, 'Outback Feast was perfect for our school fete. The kids and parents loved the BBQ spread. Brett and his team were friendly and professional. Great value for a large outdoor event.', 'approved'),

-- Extra reviews not linked to bookings
(1,  NULL,'Aryan Patel',     'AP', 'Birthday Party',     'Jan 2026', 5, 'Priya and the team catered my 40th birthday and everyone was blown away. The live dosa station was interactive and delicious. Best decision I made for the party!', 'approved'),
(8,  NULL,'Claire Dubois',   'CD', 'Private Dinner',     'Dec 2025', 5, 'La Petite Bouchee is in a class of their own. Isabelle personally oversaw every detail. The five-course degustation was flawless. Worth every cent.', 'approved'),
(4,  NULL,'Samantha Green',  'SG', 'Wedding',            'Nov 2025', 5, 'We chose Green Table Co. for our eco-wedding and they were perfect. Creative, beautiful food and zero single-use plastic. Our vegan guests were thrilled.', 'approved'),
(9,  NULL,'Kevin Matsuda',   'KM', 'Corporate Event',    'Jan 2026', 5, 'Kenji''s team created an authentic Japanese experience that delighted our Japanese business partners. Exceptional attention to detail and presentation.', 'approved'),
(2,  NULL,'Rachel Hughes',   'RH', 'Engagement Party',   'Feb 2026', 5, 'Marcus from Graze & Glory absolutely nailed our engagement party. The cheese and charcuterie selection was extraordinary and the styling was magazine-worthy.', 'approved'),
(5,  NULL,'Giulia Romano',   'GR', 'Birthday Dinner',    'Mar 2026', 5, 'Casa Bella brought the warmth of Italy to our dinner. Marco''s handmade pastas were extraordinary. Our Italian nonna gave it her seal of approval, which says everything!', 'approved'),
(10, NULL,'George Dimitriou','GD', 'Cultural Festival',  'Apr 2026', 5, 'Meze & More always delivers. The lamb spit is legendary in our community. Generous portions and authentic flavours. Book early - they fill up fast!', 'approved'),
(3,  NULL,'Patricia Moore',  'PM', 'Gala Dinner',        'Mar 2026', 5, 'Harbour Kitchen catered our annual gala and the seafood display was spectacular. Guests came up to me all night saying it was the best event catering they had experienced.', 'approved'),

-- Pending reviews
(6,  NULL,'Mei Lin',         'ML', 'Staff Party',        'May 2026', 4, 'Really enjoyed the Asian street food vibe. Lots of variety and the bao were amazing. Would have liked slightly spicier options but overall great.', 'pending'),
(7,  NULL,'Tom Bradshaw',    'TB', 'Outdoor BBQ',        'May 2026', 3, 'Food was tasty but setup took longer than expected. Brett was apologetic and sorted it out, but the first 30 minutes were a bit stressful. Food quality itself was excellent.', 'pending'),
(1,  NULL,'Nadia Khan',      'NK', 'Conference Lunch',   'Jun 2026', 5, 'Exceptional halal catering for our conference. Every dietary requirement was handled perfectly and the food was absolutely delicious. The chaat counter was a huge talking point.', 'pending'),
(8,  NULL,'David Thornton',  'DT', 'Corporate Gala',     'Jun 2026', 5, 'La Petite Bouchee set the standard for our annual gala. Flawless execution from beginning to end. Isabelle and her team are true professionals.', 'pending');

-- ──────────────────────────────────────────────────────────────
-- PAYOUTS (for completed bookings)
-- ──────────────────────────────────────────────────────────────
INSERT INTO payouts (caterer_id, booking_id, amount, status, payout_date, reference, notes) VALUES
(1,  1,  3484.80, 'completed', '2026-02-21', 'PAY-2602-001', 'Bank transfer processed'),
(2,  2,  3194.40, 'completed', '2026-02-28', 'PAY-2602-002', 'Bank transfer processed'),
(8,  3,  4356.00, 'completed', '2026-03-08', 'PAY-2603-001', 'Bank transfer processed'),
(4,  4,  4840.00, 'completed', '2026-03-15', 'PAY-2603-002', 'Bank transfer processed'),
(5,  5,  7550.40, 'completed', '2026-03-22', 'PAY-2603-003', 'Bank transfer processed'),
(10, 6,  4530.24, 'completed', '2026-03-29', 'PAY-2603-004', 'Bank transfer processed'),
(3,  7,  3630.00, 'completed', '2026-04-11', 'PAY-2604-001', 'Bank transfer processed'),
(9,  8,  2831.40, 'completed', '2026-04-17', 'PAY-2604-002', 'Bank transfer processed'),
(6,  9,  8712.00, 'completed', '2026-04-25', 'PAY-2604-003', 'Bank transfer processed'),
(7,  10, 5517.60, 'completed', '2026-05-09', 'PAY-2605-001', 'Bank transfer processed');

-- ──────────────────────────────────────────────────────────────
-- CONTACT ENQUIRIES (16)
-- ──────────────────────────────────────────────────────────────
INSERT INTO contact_enquiries (first_name, last_name, email, phone, message, caterer_id, status, created_at) VALUES
('Sarah',   'O''Brien',   'sarah.obrien@events.com.au',  '0411 200 001', 'Hi, I''m planning a corporate lunch for 80 people in August. Could you let me know if you are available for the 15th and what your Indian feast menu would cost?', 1, 'read', '2026-05-10 09:30:00'),
('Michael', 'Chang',     'mchang@techco.com.au',        '0412 200 002', 'We are hosting a product launch for 50 guests at a rooftop venue in South Yarra. Looking for grazing tables and roaming canapés. Please send through pricing.', 2, 'replied', '2026-05-12 10:00:00'),
('Fiona',   'McLaren',   'fiona.mc@events.net.au',      '0413 200 003', 'I would like to enquire about seafood catering for a 100-person gala dinner in September. Do you supply all equipment including tables and linen?', 3, 'new', '2026-05-15 11:00:00'),
('Ahmed',   'Hassan',    'ahmed.h@community.org.au',    '0414 200 004', 'We are organising a community Ramadan iftar dinner for 200 people. Can you provide fully halal certified catering? Please confirm certifications.', 1, 'new', '2026-05-18 14:00:00'),
('Brooke',  'Patterson', 'brooke.p@yoga.com.au',        '0415 200 005', 'I run a wellness retreat and need plant-based catering for a 3-day event with 30 guests. Can you accommodate fully raw vegan on day 1 and cooked plant-based on days 2-3?', 4, 'read', '2026-05-20 09:00:00'),
('Anthony', 'Russo',     'anthony.r@venue.com.au',      '0416 200 006', 'I am the events coordinator at a Richmond venue. We are looking for a reliable Italian caterer for regular events. Can we arrange a tasting?', 5, 'replied', '2026-05-22 11:30:00'),
('Mei',     'Jiang',     'mei.jiang@uni.edu.au',         '0417 200 007', 'University O-Week event for 400 students. Need affordable, high-volume catering with vegetarian options. Can the Noodle Bar Collective handle this scale?', 6, 'new', '2026-05-25 13:00:00'),
('Brad',    'Sullivan',  'brad.s@construction.com.au',  '0418 200 008', 'Looking for BBQ catering for a team of 60 at our work site in Footscray. Nothing fancy, just good quality Aussie BBQ. What would this cost?', 7, 'read', '2026-05-27 08:30:00'),
('Eleanor', 'Fairfax',   'eleanor.f@charity.org',       '0419 200 009', 'We are hosting a charity gala for 80 guests at the NGV. Looking for premium French canapés and a champagne reception. Budget is approx $12,000 all-inclusive.', 8, 'replied', '2026-05-28 15:00:00'),
('Tom',     'Nakamura',  'tom.n@finance.com.au',        '0421 200 010', 'Monthly office lunches for 25 people at a CBD location. Looking for Japanese catering on a rotating basis. Can Sushi Matsuri do recurring bookings?', 9, 'read', '2026-05-30 10:00:00'),
('Demi',    'Karaolis',  'demi.k@greek.org.au',          '0422 200 011', 'Annual Greek community Paniyiri festival catering enquiry. Expected 500+ attendees over 2 days. We want meze, lamb spit, and souvlaki stations. Please contact.', 10,'new', '2026-06-01 09:30:00'),
('Priya',   'Iyer',      'priya.iyer@wedding.com.au',   '0423 200 012', 'South Indian wedding reception for 180 guests. Need authentic Tamil and Kerala dishes including biryani, curries, and sweet stations. Date is November 2026.', 1, 'new', '2026-06-03 11:00:00'),
('Oliver',  'Grant',     'oliver.g@corp.com.au',        '0424 200 013', 'Annual Christmas party for 120 people at a South Yarra rooftop. Looking for grazing tables and a mix of hot and cold canapés. What are your December availability?', 2, 'new', '2026-06-05 14:00:00'),
('Alice',   'Morgan',    'alice.m@birthday.com.au',     '0425 200 014', 'Organising a surprise 50th birthday party for 60 guests at home. Italian theme. Would love pasta station plus antipasto. Budget around $4,500. Is this feasible?', 5, 'new', '2026-06-08 10:30:00'),
('Steve',   'Murdoch',   'steve.m@media.com.au',        '0426 200 015', 'Media awards night for 75 guests at Docklands. Looking for premium seafood catering with a live oyster shucking station as a feature. Please send your event packages.', 3, 'new', '2026-06-10 09:00:00'),
('Yuki',    'Watanabe',  'yuki.w@tech.com.au',           '0427 200 016', 'Tech company end of year party for 100 people. Japanese theme, looking for sushi platters, teppanyaki station, and sake service. Date TBC in December 2026.', 9, 'new', '2026-06-12 11:00:00');

-- ──────────────────────────────────────────────────────────────
-- CATERER APPLICATIONS (10)
-- ──────────────────────────────────────────────────────────────
INSERT INTO caterer_applications (business_name, contact_name, email, phone, cuisine, service_area, status, admin_notes, created_at) VALUES
('Tandoor Tales',        'Rajesh Kumar',     'rajesh@tandoortales.com.au',    '0411 300 001', 'Indian', 'Melbourne CBD, Inner North', 'reviewing', 'ABN checked. References requested from 3 prior events. Follow up this week.', '2026-05-08 09:00:00'),
('Seoul Kitchen Co.',    'Ji-Yeon Park',     'jiyeon@seoulkitchen.com.au',   '0412 300 002', 'Korean', 'South Yarra, Prahran, St Kilda', 'new', NULL, '2026-05-14 10:30:00'),
('The Tuscan Table',     'Francesca Bianchi','franci@tuscantable.com.au',     '0413 300 003', 'Italian', 'Richmond, Hawthorn, Kew', 'approved', 'Excellent credentials. Former Grossi Florentino sous chef. Approved for listing.', '2026-04-20 11:00:00'),
('Morrocan Nights',      'Youssef El Fassi', 'youssef@morocannights.com.au', '0414 300 004', 'Moroccan', 'Melbourne-wide', 'reviewing', 'Food safety cert expires in 3 months. Requested renewal before approval.', '2026-05-18 14:00:00'),
('Peruvian Pantry',      'Carlos Vega',      'carlos@peruvianpantry.com.au', '0415 300 005', 'Peruvian', 'Fitzroy, Collingwood, CBD', 'new', NULL, '2026-05-22 09:30:00'),
('Fire & Feast BBQ',     'Kyle Nguyen',      'kyle@fireandfeast.com.au',     '0416 300 006', 'BBQ', 'Outer East Melbourne', 'approved', 'Great setup and strong references. Approved with note to confirm $20M PLI.', '2026-05-01 10:00:00'),
('Dim Sum Dynasty',      'Helen Wong',       'helen@dimsumdynasty.com.au',   '0417 300 007', 'Chinese', 'Chinatown, CBD, Docklands', 'reviewing', 'Requested to see commercial kitchen compliance certificate.', '2026-05-25 13:00:00'),
('The Lebanese Table',   'Nada Sleiman',     'nada@lebanesetable.com.au',    '0418 300 008', 'Lebanese', 'Carlton, Brunswick, Coburg', 'new', NULL, '2026-06-01 09:00:00'),
('Nordic Nibbles',       'Astrid Lindqvist', 'astrid@nordicnibbles.com.au',  '0419 300 009', 'Nordic', 'South Yarra, Toorak, Armadale', 'new', NULL, '2026-06-05 11:30:00'),
('Spice Islands Catering','Budi Santoso',    'budi@spiceislands.com.au',     '0421 300 010', 'Indonesian', 'Springvale, Dandenong, CBD', 'rejected', 'Food safety certificate not current. ABN not verified. Recommended to reapply when documentation is complete.', '2026-04-15 14:00:00');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Seed complete.
-- 10 caterers, 20 menus, 30 bookings, 22 reviews,
-- 10 payouts, 16 enquiries, 10 applications inserted.
-- Image paths reference assets/uploads/2026/06/*.webp
-- Use IMAGE_GENERATION_INSTRUCTIONS.md to generate images,
-- then upload via the Media Restore feature in Settings.
-- ============================================================
