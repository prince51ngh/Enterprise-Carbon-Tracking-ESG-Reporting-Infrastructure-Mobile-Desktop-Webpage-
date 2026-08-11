-- Create database
CREATE DATABASE IF NOT EXISTS verdeledger_db;
USE verdeledger_db;

-- ── Table: contacts ─────────────────────────────────────────
-- Stores enterprise consultation form submissions
CREATE TABLE IF NOT EXISTS contacts (
    id          INT             AUTO_INCREMENT PRIMARY KEY,
    rep_name    VARCHAR(100)    NOT NULL,
    rep_email   VARCHAR(150)    NOT NULL,
    phone       VARCHAR(30)     NULL,
    scope       VARCHAR(50)     NOT NULL,
    details     TEXT            NOT NULL,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ── Table: estimates ────────────────────────────────────────
-- Stores carbon estimation calculator results
CREATE TABLE IF NOT EXISTS estimates (
    id                INT             AUTO_INCREMENT PRIMARY KEY,
    monthly_power_kwh DECIMAL(12,2)   NOT NULL,
    fleet_miles       DECIMAL(12,2)   NOT NULL,
    total_co2_kg      DECIMAL(12,2)   NOT NULL,
    created_at        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ── Table: newsletter_subscribers ───────────────────────────
-- Stores newsletter email subscriptions
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    subscribed_at   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ── Verify tables created ───────────────────────────────────
SHOW TABLES;
