const pool = require('../config/db');

const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, u.name AS actor_name, u.profile_pic AS actor_pic,
              EXISTS(SELECT 1 FROM followers f WHERE f.follower_id = $1 AND f.following_id = n.actor_id) AS is_following
       FROM notifications n
       LEFT JOIN users u ON n.actor_id = u.id
       WHERE n.recipient_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({ success: true, notifications: result.rows });
  } catch (err) {
    console.error('[getNotifications]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE notifications SET is_read = TRUE, read_at = NOW()
       WHERE id = $1 AND recipient_id = $2`,
      [id, req.user.id]
    );
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    console.error('[markAsRead]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = TRUE, read_at = NOW()
       WHERE recipient_id = $1 AND is_read = FALSE`,
      [req.user.id]
    );
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('[markAllAsRead]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
