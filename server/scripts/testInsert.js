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
    const projectResult = await pool.query('SELECT * FROM projects WHERE id = 1');
    if (projectResult.rows.length === 0) {
      console.log('No project found with id 1');
      return;
    }
    const project = projectResult.rows[0];

    const insertResult = await pool.query(
      `INSERT INTO notifications (recipient_id, actor_id, project_id, type, message, is_private)
       VALUES ($1, $2, $3, 'comment', $4, $5) RETURNING *`,
      [project.user_id, project.user_id, project.id, 'Test comment from script', true]
    );
    console.log('Successfully inserted:', insertResult.rows[0]);
  } catch (err) {
    console.error('Insert error exactly:', err.message);
  } finally {
    pool.end();
  }
}

run();
