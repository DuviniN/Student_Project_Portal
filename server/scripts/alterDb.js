const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function run() {
  try {
    await pool.query('ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT FALSE;');
    console.log('Successfully added is_private column to notifications table.');
  } catch (err) {
    console.error('Error altering table:', err.message);
  } finally {
    pool.end();
  }
}

run();
