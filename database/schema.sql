-- ============================================================
-- Caterus — Full Database Schema
-- ============================================================
CREATE DATABASE IF NOT EXISTS caterus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE caterus;

-- ──────────────────────────────────────────────────────────────
-- ADMINS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100),
  role          ENUM('super_admin','admin') DEFAULT 'admin',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- CATERERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS caterers (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  slug            VARCHAR(150) NOT NULL UNIQUE,
  business_name   VARCHAR(200) NOT NULL,
  tagline         VARCHAR(300),
  description     TEXT,
  cuisine_type    VARCHAR(100),
  suburb          VARCHAR(100),
  city            VARCHAR(100) DEFAULT 'Melbourne',
  postcode        VARCHAR(10),
  state           VARCHAR(50)  DEFAULT 'VIC',
  contact_name    VARCHAR(150),
  contact_email   VARCHAR(255),
  contact_phone   VARCHAR(20),
  abn             VARCHAR(20),
  price_from      DECIMAL(8,2),
  min_guests      INT DEFAULT 20,
  max_guests      INT DEFAULT 500,
  min_notice_days INT DEFAULT 7,
  response_time   VARCHAR(50) DEFAULT '~2 hours',
  featured_image  VARCHAR(500),
  is_published    BOOLEAN DEFAULT FALSE,
  is_featured     BOOLEAN DEFAULT FALSE,
  is_promoted     BOOLEAN DEFAULT FALSE,
  rating_avg      DECIMAL(3,2) DEFAULT 0.00,
  review_count    INT DEFAULT 0,
  status          ENUM('draft','pending','active','suspended') DEFAULT 'draft',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_published (is_published),
  INDEX idx_suburb (suburb),
  INDEX idx_cuisine (cuisine_type)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- CATERER IMAGES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS caterer_images (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  caterer_id  INT NOT NULL,
  image_path  VARCHAR(500),
  alt_text    VARCHAR(200),
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (caterer_id) REFERENCES caterers(id) ON DELETE CASCADE,
  INDEX idx_caterer (caterer_id)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- CATERER TAGS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS caterer_tags (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  caterer_id  INT NOT NULL,
  tag         VARCHAR(50) NOT NULL,
  FOREIGN KEY (caterer_id) REFERENCES caterers(id) ON DELETE CASCADE,
  INDEX idx_caterer (caterer_id)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- CATERER OCCASIONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS caterer_occasions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  caterer_id  INT NOT NULL,
  occasion    VARCHAR(100) NOT NULL,
  FOREIGN KEY (caterer_id) REFERENCES caterers(id) ON DELETE CASCADE,
  INDEX idx_caterer (caterer_id)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- CATERER SPECIALTIES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS caterer_specialties (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  caterer_id  INT NOT NULL,
  specialty   VARCHAR(100) NOT NULL,
  FOREIGN KEY (caterer_id) REFERENCES caterers(id) ON DELETE CASCADE,
  INDEX idx_caterer (caterer_id)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- CATERER INCLUSIONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS caterer_inclusions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  caterer_id  INT NOT NULL,
  title       VARCHAR(150) NOT NULL,
  description TEXT,
  sort_order  INT DEFAULT 0,
  FOREIGN KEY (caterer_id) REFERENCES caterers(id) ON DELETE CASCADE,
  INDEX idx_caterer (caterer_id)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- VETTING CHECKLISTS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vetting_checklists (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  caterer_id        INT NOT NULL UNIQUE,
  food_safety_cert  BOOLEAN DEFAULT FALSE,
  food_safety_expiry DATE,
  food_safety_doc   VARCHAR(500),
  public_liability  BOOLEAN DEFAULT FALSE,
  liability_amount  VARCHAR(50),
  liability_expiry  DATE,
  liability_doc     VARCHAR(500),
  abn_verified      BOOLEAN DEFAULT FALSE,
  quality_check     BOOLEAN DEFAULT FALSE,
  quality_notes     TEXT,
  approved_by       INT,
  approved_at       TIMESTAMP NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (caterer_id) REFERENCES caterers(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- MENUS (packages)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menus (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  caterer_id      INT NOT NULL,
  name            VARCHAR(150) NOT NULL,
  slug            VARCHAR(150),
  description     TEXT,
  price_per_head  DECIMAL(8,2) NOT NULL,
  is_featured     BOOLEAN DEFAULT FALSE,
  sort_order      INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (caterer_id) REFERENCES caterers(id) ON DELETE CASCADE,
  INDEX idx_caterer (caterer_id)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- MENU ITEMS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  menu_id       INT NOT NULL,
  name          VARCHAR(200) NOT NULL,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  sort_order    INT DEFAULT 0,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
  INDEX idx_menu (menu_id)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- ADD-ONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addons (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  caterer_id      INT NOT NULL,
  name            VARCHAR(200) NOT NULL,
  price_per_head  DECIMAL(8,2),
  description     TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (caterer_id) REFERENCES caterers(id) ON DELETE CASCADE,
  INDEX idx_caterer (caterer_id)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- BOOKINGS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  reference             VARCHAR(20) UNIQUE,
  caterer_id            INT,
  menu_id               INT,
  customer_first_name   VARCHAR(100),
  customer_last_name    VARCHAR(100),
  customer_email        VARCHAR(255),
  customer_phone        VARCHAR(20),
  event_date            DATE,
  guest_count           INT,
  price_per_head        DECIMAL(8,2),
  addons_total          DECIMAL(10,2) DEFAULT 0.00,
  subtotal              DECIMAL(10,2),
  gst                   DECIMAL(10,2),
  total                 DECIMAL(10,2),
  commission_rate       DECIMAL(5,2),
  commission_amount     DECIMAL(10,2),
  caterer_payout        DECIMAL(10,2),
  dietary_requirements  TEXT,
  special_requests      TEXT,
  status                ENUM('pending','confirmed','assigned','completed','cancelled','refunded') DEFAULT 'pending',
  payment_status        ENUM('unpaid','paid','refunded','partial_refund') DEFAULT 'unpaid',
  stripe_session_id     VARCHAR(255),
  stripe_payment_intent VARCHAR(255),
  confirmed_at          TIMESTAMP NULL,
  completed_at          TIMESTAMP NULL,
  cancelled_at          TIMESTAMP NULL,
  cancellation_reason   TEXT,
  admin_notes           TEXT,
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (caterer_id) REFERENCES caterers(id) ON DELETE SET NULL,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE SET NULL,
  INDEX idx_reference (reference),
  INDEX idx_caterer (caterer_id),
  INDEX idx_status (status),
  INDEX idx_payment (payment_status),
  INDEX idx_date (event_date),
  INDEX idx_stripe (stripe_session_id)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- BOOKING ADD-ONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_addons (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  booking_id      INT NOT NULL,
  addon_id        INT,
  name            VARCHAR(200),
  price_per_head  DECIMAL(8,2),
  quantity        INT,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (addon_id) REFERENCES addons(id) ON DELETE SET NULL,
  INDEX idx_booking (booking_id)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- REVIEWS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  caterer_id        INT NOT NULL,
  booking_id        INT,
  reviewer_name     VARCHAR(150),
  reviewer_initials VARCHAR(5),
  event_type        VARCHAR(100),
  event_date        VARCHAR(50),
  rating            TINYINT NOT NULL,
  comment           TEXT,
  status            ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (caterer_id) REFERENCES caterers(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_caterer (caterer_id),
  INDEX idx_status (status),
  INDEX idx_rating (rating)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- PAYMENTS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  booking_id            INT NOT NULL,
  stripe_payment_intent VARCHAR(255),
  amount                DECIMAL(10,2),
  currency              VARCHAR(3) DEFAULT 'aud',
  status                VARCHAR(50),
  method                VARCHAR(50),
  receipt_url           VARCHAR(500),
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking (booking_id)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- PAYOUTS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payouts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  caterer_id    INT NOT NULL,
  booking_id    INT,
  amount        DECIMAL(10,2),
  status        ENUM('pending','processing','completed','failed') DEFAULT 'pending',
  payout_date   DATE,
  reference     VARCHAR(100),
  notes         TEXT,
  processed_by  INT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (caterer_id) REFERENCES caterers(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (processed_by) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_caterer (caterer_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- CONTACT ENQUIRIES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_enquiries (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  first_name  VARCHAR(100),
  last_name   VARCHAR(100),
  email       VARCHAR(255),
  phone       VARCHAR(20),
  message     TEXT,
  caterer_id  INT,
  status      ENUM('new','read','replied','closed') DEFAULT 'new',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (caterer_id) REFERENCES caterers(id) ON DELETE SET NULL,
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- CATERER APPLICATIONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS caterer_applications (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  business_name VARCHAR(200),
  contact_name  VARCHAR(150),
  email         VARCHAR(255),
  phone         VARCHAR(20),
  cuisine       VARCHAR(100),
  service_area  VARCHAR(200),
  status        ENUM('new','reviewing','approved','rejected') DEFAULT 'new',
  admin_notes   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ──────────────────────────────────────────────────────────────
-- SETTINGS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  setting_key   VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_group VARCHAR(50),
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_group (setting_group)
) ENGINE=InnoDB;
