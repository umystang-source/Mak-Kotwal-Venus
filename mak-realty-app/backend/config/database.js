const { Pool } = require('pg');
require('dotenv').config();

// Determine if SSL should be used (only for external databases like AWS RDS)
const useSSL = process.env.DATABASE_SSL === 'true';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false
});

// Initialize database tables
const initDB = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        two_factor_enabled BOOLEAN DEFAULT false,
        two_factor_secret VARCHAR(255),
        is_visible BOOLEAN DEFAULT true,
        visible_attributes JSONB DEFAULT '{"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":true,"8":true,"9":true,"10":true,"11":true,"12":true,"13":true}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        project_name VARCHAR(255) NOT NULL,
        developer_name VARCHAR(255),
        location VARCHAR(255),
        plot_size VARCHAR(255),
        total_towers INTEGER,
        total_floors INTEGER,
        possession VARCHAR(255),
        budget_min DECIMAL(15, 2),
        budget_max DECIMAL(15, 2),
        carpet_area_min INTEGER,
        carpet_area_max INTEGER,
        configurations TEXT[],
        rate_psf_min DECIMAL(15, 2),
        rate_psf_max DECIMAL(15, 2),
        availability_status VARCHAR(100) DEFAULT 'Ready',
        notes TEXT,
        client_requirement_tags TEXT[],
        google_maps_link TEXT,
        is_visible BOOLEAN DEFAULT true,
        visibility_settings JSONB DEFAULT '{}',
        attribute_1 VARCHAR(255),
        attribute_2 VARCHAR(255),
        attribute_3 VARCHAR(255),
        attribute_4 VARCHAR(255),
        attribute_5 VARCHAR(255),
        attribute_6 VARCHAR(255),
        attribute_7 VARCHAR(255),
        attribute_8 VARCHAR(255),
        attribute_9 VARCHAR(255),
        attribute_10 VARCHAR(255),
        attribute_11 VARCHAR(255),
        attribute_12 VARCHAR(255),
        attribute_13 VARCHAR(255),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new columns if they don't exist (for existing databases)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='plot_size') THEN
          ALTER TABLE projects ADD COLUMN plot_size VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='total_towers') THEN
          ALTER TABLE projects ADD COLUMN total_towers INTEGER;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='total_floors') THEN
          ALTER TABLE projects ADD COLUMN total_floors INTEGER;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='possession') THEN
          ALTER TABLE projects ADD COLUMN possession VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='rate_psf_min') THEN
          ALTER TABLE projects ADD COLUMN rate_psf_min DECIMAL(15, 2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='rate_psf_max') THEN
          ALTER TABLE projects ADD COLUMN rate_psf_max DECIMAL(15, 2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='notes') THEN
          ALTER TABLE projects ADD COLUMN notes TEXT;
        END IF;
        -- Add attribute columns for Additional Details
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='attribute_1') THEN
          ALTER TABLE projects ADD COLUMN attribute_1 VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='attribute_2') THEN
          ALTER TABLE projects ADD COLUMN attribute_2 VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='attribute_3') THEN
          ALTER TABLE projects ADD COLUMN attribute_3 VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='attribute_4') THEN
          ALTER TABLE projects ADD COLUMN attribute_4 VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='attribute_5') THEN
          ALTER TABLE projects ADD COLUMN attribute_5 VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='attribute_6') THEN
          ALTER TABLE projects ADD COLUMN attribute_6 VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='attribute_7') THEN
          ALTER TABLE projects ADD COLUMN attribute_7 VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='attribute_8') THEN
          ALTER TABLE projects ADD COLUMN attribute_8 VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='attribute_9') THEN
          ALTER TABLE projects ADD COLUMN attribute_9 VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='attribute_10') THEN
          ALTER TABLE projects ADD COLUMN attribute_10 VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='attribute_11') THEN
          ALTER TABLE projects ADD COLUMN attribute_11 VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='attribute_12') THEN
          ALTER TABLE projects ADD COLUMN attribute_12 VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='attribute_13') THEN
          ALTER TABLE projects ADD COLUMN attribute_13 VARCHAR(255);
        END IF;
      END $$;
    `);

    // Project Media table (for floor plans, videos, brochures)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_media (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('floor_plan', 'video', 'brochure', 'image', 'pdf')),
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER,
        configuration VARCHAR(50),
        description VARCHAR(255),
        is_visible BOOLEAN DEFAULT true,
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // OTP table for 2FA
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        code VARCHAR(6) NOT NULL,
        type VARCHAR(20) DEFAULT 'email' CHECK (type IN ('email', 'sms')),
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Activity log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        details JSONB,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

module.exports = { pool, initDB };
