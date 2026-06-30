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
    await pool.query('ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;');
    await pool.query("ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('like', 'follow', 'project_created', 'comment'));");
    console.log('Successfully updated notifications_type_check constraint.');
  } catch (err) {
    console.error('Error altering constraint:', err.message);
  } finally {
    pool.end();
  }
}

run();
