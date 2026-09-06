foodfood_name-- ==========================================================
-- Database Schema for SHERO-NourishNet
-- AI-Driven Food Waste Prediction & Intelligent Redistribution System
-- ==========================================================

CREATE DATABASE IF NOT EXISTS shero_nourishnet;
USE shero_nourishnet;

-- ----------------------------------------------------------
-- Table 1: users
-- Stores all registered system users (DONOR, NGO, VOLUNTEER, ADMIN)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('DONOR', 'NGO', 'VOLUNTEER', 'ADMIN') NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- Table 2: food
-- Stores food items listed by Donors
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS food (
    food_id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    food_name VARCHAR(150) NOT NULL,
    food_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    prepared_time DATETIME NOT NULL,
    expiry_time DATETIME NOT NULL,
    image_path VARCHAR(255) NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    status ENUM('AVAILABLE', 'RESERVED', 'DELIVERED', 'EXPIRED') DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- Table 3: food_requests
-- Stores requests placed by NGOs for surplus food items
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    food_id INT NOT NULL,
    ngo_id INT NOT NULL,
    requested_quantity DECIMAL(10, 2) NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED') DEFAULT 'PENDING',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (food_id) REFERENCES food(food_id) ON DELETE CASCADE,
    FOREIGN KEY (ngo_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- Table 4: deliveries
-- Stores delivery tracking records assigned to Volunteers
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS deliveries (
    delivery_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    volunteer_id INT NOT NULL,
    status ENUM('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED') DEFAULT 'ASSIGNED',
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    FOREIGN KEY (request_id) REFERENCES food_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- Table 5: tracking
-- Real-time GPS coordinate logs for active deliveries
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS tracking (
    tracking_id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(delivery_id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- Table 6: feedback
-- Post-delivery ratings and comments from users
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_id INT NOT NULL,
    from_user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(delivery_id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
