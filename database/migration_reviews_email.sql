-- Add reviewer_email column to reviews table
-- Run once: mysql -u USER -p DATABASE < migration_reviews_email.sql

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_email VARCHAR(255) DEFAULT NULL AFTER reviewer_initials;
