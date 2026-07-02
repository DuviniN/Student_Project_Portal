require('node:dns').setDefaultResultOrder('ipv4first');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
  ssl: { rejectUnauthorized: false }
});

const bcrypt = require('bcryptjs');

async function addAdmin(email, rawPassword) {
  const query = `
    INSERT INTO users (name, email, role, admin_verified, password) 
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (email) DO UPDATE 
    SET password = EXCLUDED.password, 
        role = EXCLUDED.role, 
        admin_verified = EXCLUDED.admin_verified,
        name = EXCLUDED.name;
  `;

  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const values = [
      'Admin User', // name
      email,
      'admin',      // role
      true,         // admin_verified
      hashedPassword
    ];
    
    await pool.query(query, values);
    console.log(`✅ Admin user '${email}' inserted/updated successfully in Neon Database!`);
    console.log(`🔑 You can now login locally using:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${rawPassword}`);
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await pool.end();
  }
}

// Change the email and password here if you want!
addAdmin('larmora.admin@gmail.com', 'Admin123!');
