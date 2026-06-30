const pool = require('../config/db');
const cloudinary = require('../config/cloudinary');
const emitter = require('../events/eventEmitter');

const getAllProjects = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, tag, status = 'published' } = req.query;
    
    if ((status === 'draft' || status === 'all') && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: `Forbidden: Cannot view ${status} projects` });
    }

    const offset = (page - 1) * limit;
    const params = [parseInt(limit, 10), offset];
    let whereClause = 'WHERE 1=1';

    if (status !== 'all') {
      params.push(status);
      whereClause += ` AND p.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }

    const result = await pool.query(
      `SELECT p.*, u.name AS author_name, u.profile_pic AS author_pic, u.student_id,
              COALESCE(l.like_count, 0)::int AS like_count,
              ARRAY_REMOVE(ARRAY_AGG(DISTINCT pt.tag), NULL) AS tags
       FROM projects p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN (SELECT project_id, COUNT(*) AS like_count FROM likes GROUP BY project_id) l
         ON p.id = l.project_id
       LEFT JOIN project_tags pt ON p.id = pt.project_id
       ${whereClause}
       GROUP BY p.id, u.name, u.profile_pic, u.student_id, l.like_count
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    const countParams = [];
    let countWhereClause = 'WHERE 1=1';
    if (status !== 'all') {
      countParams.push(status);
      countWhereClause += ` AND status = $${countParams.length}`;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM projects ${countWhereClause}`,
      countParams
    );

    res.json({
      success: true,
      projects: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page: parseInt(page, 10),
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (err) {
    console.error('[getAllProjects]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('UPDATE projects SET view_count = view_count + 1 WHERE id = $1', [id]);

    const result = await pool.query(
      `SELECT p.*, u.name AS author_name, u.profile_pic AS author_pic, u.student_id,
              COALESCE(l.like_count, 0)::int AS like_count,
              ARRAY_REMOVE(ARRAY_AGG(DISTINCT pt.tag), NULL) AS tags
       FROM projects p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN (SELECT project_id, COUNT(*) AS like_count FROM likes GROUP BY project_id) l
         ON p.id = l.project_id
       LEFT JOIN project_tags pt ON p.id = pt.project_id
       WHERE p.id = $1
       GROUP BY p.id, u.name, u.profile_pic, u.student_id, l.like_count`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const project = result.rows[0];
    if (project.status === 'draft') {
      const isOwner = req.user && req.user.id === project.user_id;
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden.' });
      }
    }

    res.json({ success: true, project });
  } catch (err) {
    console.error('[getProject]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const createProject = async (req, res) => {
  const client = await pool.connect();
  try {
    const { title, description, github_url, demo_url, tech_stack, tags, status } = req.body;
    let thumbnail_url = null;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'uok-connect/thumbnails', resource_type: 'image' },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      thumbnail_url = result.secure_url;
    }

    let techStackJson = '[]';
    let tagArray = [];
    try {
      techStackJson = JSON.stringify(Array.isArray(tech_stack) ? tech_stack : JSON.parse(tech_stack || '[]'));
      tagArray = Array.isArray(tags) ? tags : JSON.parse(tags || '[]');
    } catch (e) {
      console.warn('Invalid JSON in tech_stack or tags:', e.message);
    }

    await client.query('BEGIN');

    const insertResult = await client.query(
      `INSERT INTO projects (user_id, title, description, thumbnail_url, github_url, demo_url, tech_stack, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.id, title, description, thumbnail_url, github_url || null, demo_url || null, techStackJson, status || 'published']
    );

    const project = insertResult.rows[0];

    if (tagArray.length) {
      const tagValues = tagArray.map((_, i) => `($1, $${i + 2})`).join(', ');
      await client.query(
        `INSERT INTO project_tags (project_id, tag) VALUES ${tagValues}`,
        [project.id, ...tagArray]
      );
    }

    await client.query('COMMIT');

    emitter.emit('ProjectCreated', { project, user: req.user });

    res.status(201).json({ success: true, project });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[createProject]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    client.release();
  }
};

const updateProject = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const project = existing.rows[0];
    const isOwner = project.user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const { title, description, github_url, demo_url, tech_stack, tags, status } = req.body;
    let thumbnail_url = project.thumbnail_url;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'uok-connect/thumbnails', resource_type: 'image' },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      thumbnail_url = result.secure_url;
    }

    let techStackJson = project.tech_stack;
    let tagArray = [];
    try {
      if (tech_stack) {
        techStackJson = JSON.stringify(Array.isArray(tech_stack) ? tech_stack : JSON.parse(tech_stack));
      }
      if (tags !== undefined) {
        tagArray = Array.isArray(tags) ? tags : JSON.parse(tags || '[]');
      }
    } catch (e) {
      console.warn('Invalid JSON in tech_stack or tags:', e.message);
    }

    await client.query('BEGIN');

    const updated = await client.query(
      `UPDATE projects
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           thumbnail_url = $3,
           github_url = COALESCE($4, github_url),
           demo_url = COALESCE($5, demo_url),
           tech_stack = $6,
           status = COALESCE($7, status),
           updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [title, description, thumbnail_url, github_url, demo_url, techStackJson, status, id]
    );

    if (tags !== undefined) {
      await client.query('DELETE FROM project_tags WHERE project_id = $1', [id]);
      if (tagArray.length) {
        const tagValues = tagArray.map((_, i) => `($1, $${i + 2})`).join(', ');
        await client.query(
          `INSERT INTO project_tags (project_id, tag) VALUES ${tagValues}`,
          [id, ...tagArray]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, project: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[updateProject]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    client.release();
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const project = existing.rows[0];
    const isOwner = project.user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    console.error('[deleteProject]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const likeProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (!projectResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const existing = await pool.query(
      'SELECT id FROM likes WHERE user_id = $1 AND project_id = $2',
      [req.user.id, id]
    );

    if (existing.rows.length) {
      await pool.query('DELETE FROM likes WHERE user_id = $1 AND project_id = $2', [req.user.id, id]);
      return res.json({ success: true, liked: false, message: 'Like removed.' });
    }

    await pool.query(
      'INSERT INTO likes (user_id, project_id) VALUES ($1, $2)',
      [req.user.id, id]
    );

    emitter.emit('ProjectLiked', {
      project: projectResult.rows[0],
      actor: req.user,
    });

    res.json({ success: true, liked: true, message: 'Project liked.' });
  } catch (err) {
    console.error('[likeProject]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllProjects, getProject, createProject, updateProject, deleteProject, likeProject };
