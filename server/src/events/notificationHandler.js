const emitter = require('./eventEmitter');
const pool = require('../config/db');

// PROJECT_CREATED: notify nobody here, but log activity (extend later)
emitter.on('ProjectCreated', async ({ project, user }) => {
  try {
    console.log(`[Event] ProjectCreated: "${project.title}" by user ${user.id}`);
    // Future: notify followers
  } catch (err) {
    console.error('[Event] ProjectCreated handler error:', err.message);
  }
});

// PROJECT_LIKED: notify the project owner
emitter.on('ProjectLiked', async ({ project, actor }) => {
  try {
    if (actor.id === project.user_id) return; // no self-notification

    const message = `${actor.name} liked your project "${project.title}".`;

    await pool.query(
      `INSERT INTO notifications (recipient_id, actor_id, project_id, type, message)
       VALUES ($1, $2, $3, 'like', $4)`,
      [project.user_id, actor.id, project.id, message]
    );

    console.log(`[Event] ProjectLiked notification sent to user ${project.user_id}`);
  } catch (err) {
    console.error('[Event] ProjectLiked handler error:', err.message);
  }
});

// USER_FOLLOWED: notify the followed user
emitter.on('UserFollowed', async ({ following, follower }) => {
  try {
    const message = `${follower.name} started following you.`;

    await pool.query(
      `INSERT INTO notifications (recipient_id, actor_id, type, message)
       VALUES ($1, $2, 'follow', $3)`,
      [following.id, follower.id, message]
    );

    console.log(`[Event] UserFollowed notification sent to user ${following.id}`);
  } catch (err) {
    console.error('[Event] UserFollowed handler error:', err.message);
  }
});

// USER_REGISTERED: notify all admins when a new user registers
emitter.on('UserRegistered', async (newUser) => {
  try {
    const admins = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    const message = `${newUser.name} just registered as a ${newUser.role}.`;

    for (const admin of admins.rows) {
      await pool.query(
        `INSERT INTO notifications (recipient_id, actor_id, type, message)
         VALUES ($1, $2, 'user_registered', $3)`,
        [admin.id, newUser.id, message]
      );
    }

    console.log(`[Event] UserRegistered: notified ${admins.rows.length} admin(s) about ${newUser.name}`);
  } catch (err) {
    console.error('[Event] UserRegistered handler error:', err.message);
  }
});
