require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function addAdmin() {
  const query = `
    INSERT INTO users (name, email, role, admin_verified, password) 
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (email) DO UPDATE 
    SET password = EXCLUDED.password, 
        role = EXCLUDED.role, 
        admin_verified = EXCLUDED.admin_verified,
        name = EXCLUDED.name;
  `;
  const values = [
    'admin',
    'admin@gmail.com',
    'admin',
    true,
    '$2b$10$aPfWylZmlr2kYu9AlwelvO9I7S0Y84wQrWbd5YQjWeML0o/o9BtLG'
  ];
  // chanage hash as you need 
  try {
    const res = await pool.query(query, values);
    console.log('Admin user inserted/updated successfully.');
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await pool.end();
  }
}

addAdmin();
