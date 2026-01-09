const express = require('express');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 * 1024 }, // 3GB limit per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Search and filter projects
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const {
      project_name,
      developer_name,
      developers, // AND-type: comma-separated list for exact match (legacy)
      developers_or, // OR-type: comma-separated list, match ANY
      location,
      locations, // AND-type: comma-separated list for exact match (legacy)
      locations_or, // OR-type: comma-separated list, match ANY
      budget_min,
      budget_max,
      carpet_area_min,
      carpet_area_max,
      rate_psf_min,
      rate_psf_max,
      configurations,
      configurations_and, // AND-type: must have ALL specified configurations
      availability_status,
      availability_statuses, // AND-type: comma-separated list of statuses (legacy)
      client_tags,
      page = 1,
      limit = 10
    } = req.query;

    const isAdmin = req.user?.role === 'admin';
    let queryParams = [];
    let conditions = [];
    let paramCount = 0;

    // Only show visible projects for non-admin users
    if (!isAdmin) {
      conditions.push('p.is_visible = true');
    }

    if (project_name) {
      paramCount++;
      conditions.push(`p.project_name ILIKE $${paramCount}`);
      queryParams.push(`%${project_name}%`);
    }

    // Developer filter - supports single, AND-type, and OR-type
    if (developers_or) {
      // OR-type: match ANY of the specified developers
      const devArray = developers_or.split(',').map(d => d.trim()).filter(d => d);
      const devConditions = devArray.map(dev => {
        paramCount++;
        queryParams.push(`%${dev}%`);
        return `p.developer_name ILIKE $${paramCount}`;
      });
      if (devConditions.length > 0) {
        conditions.push(`(${devConditions.join(' OR ')})`);
      }
    } else if (developers) {
      // AND-type: must match ALL specified developers (legacy)
      const devArray = developers.split(',').map(d => d.trim()).filter(d => d);
      devArray.forEach(dev => {
        paramCount++;
        conditions.push(`p.developer_name ILIKE $${paramCount}`);
        queryParams.push(`%${dev}%`);
      });
    } else if (developer_name) {
      paramCount++;
      conditions.push(`p.developer_name ILIKE $${paramCount}`);
      queryParams.push(`%${developer_name}%`);
    }

    // Location filter - supports single, AND-type, and OR-type
    if (locations_or) {
      // OR-type: match ANY of the specified locations
      const locArray = locations_or.split(',').map(l => l.trim()).filter(l => l);
      const locConditions = locArray.map(loc => {
        paramCount++;
        queryParams.push(`%${loc}%`);
        return `p.location ILIKE $${paramCount}`;
      });
      if (locConditions.length > 0) {
        conditions.push(`(${locConditions.join(' OR ')})`);
      }
    } else if (locations) {
      // AND-type: must match ALL specified locations (legacy)
      const locArray = locations.split(',').map(l => l.trim()).filter(l => l);
      locArray.forEach(loc => {
        paramCount++;
        conditions.push(`p.location ILIKE $${paramCount}`);
        queryParams.push(`%${loc}%`);
      });
    } else if (location) {
      paramCount++;
      conditions.push(`p.location ILIKE $${paramCount}`);
      queryParams.push(`%${location}%`);
    }

    if (budget_min) {
      paramCount++;
      conditions.push(`p.budget_max >= $${paramCount}`);
      queryParams.push(parseFloat(budget_min));
    }

    if (budget_max) {
      paramCount++;
      conditions.push(`p.budget_min <= $${paramCount}`);
      queryParams.push(parseFloat(budget_max));
    }

    // Carpet area filter - range overlap (project's carpet area range overlaps with filter range)
    if (carpet_area_min) {
      paramCount++;
      conditions.push(`p.carpet_area_max >= $${paramCount}`);
      queryParams.push(parseInt(carpet_area_min));
    }

    if (carpet_area_max) {
      paramCount++;
      conditions.push(`p.carpet_area_min <= $${paramCount}`);
      queryParams.push(parseInt(carpet_area_max));
    }

    // Rate PSF filter - range overlap
    if (rate_psf_min) {
      paramCount++;
      conditions.push(`p.rate_psf_max >= $${paramCount}`);
      queryParams.push(parseFloat(rate_psf_min));
    }

    if (rate_psf_max) {
      paramCount++;
      conditions.push(`p.rate_psf_min <= $${paramCount}`);
      queryParams.push(parseFloat(rate_psf_max));
    }

    // Configuration filter - supports both OR (any match) and AND (all must match)
    if (configurations_and) {
      // AND-type: must have ALL specified configurations
      const configArray = configurations_and.split(',').map(c => c.trim()).filter(c => c);
      paramCount++;
      conditions.push(`p.configurations @> $${paramCount}`);
      queryParams.push(configArray);
    } else if (configurations) {
      // OR-type: must have at least one of the specified configurations
      const configArray = configurations.split(',').map(c => c.trim()).filter(c => c);
      paramCount++;
      conditions.push(`p.configurations && $${paramCount}`);
      queryParams.push(configArray);
    }

    // Availability status - supports both single and AND-type (multiple statuses)
    if (availability_statuses) {
      // AND-type: must match one of the specified statuses (this is effectively OR for status)
      const statusArray = availability_statuses.split(',').map(s => s.trim()).filter(s => s);
      paramCount++;
      conditions.push(`p.availability_status = ANY($${paramCount})`);
      queryParams.push(statusArray);
    } else if (availability_status) {
      paramCount++;
      conditions.push(`p.availability_status = $${paramCount}`);
      queryParams.push(availability_status);
    }

    if (client_tags) {
      const tagsArray = client_tags.split(',');
      paramCount++;
      conditions.push(`p.client_requirement_tags && $${paramCount}`);
      queryParams.push(tagsArray);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM projects p ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get projects with pagination
    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;

    const projectsQuery = `
      SELECT p.*,
             json_agg(DISTINCT jsonb_build_object(
               'id', pm.id,
               'media_type', pm.media_type,
               'file_name', pm.file_name,
               'file_path', pm.file_path,
               'configuration', pm.configuration,
               'is_visible', pm.is_visible
             )) FILTER (WHERE pm.id IS NOT NULL) as media
      FROM projects p
      LEFT JOIN project_media pm ON p.id = pm.project_id ${!isAdmin ? 'AND pm.is_visible = true' : ''}
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    queryParams.push(parseInt(limit), offset);
    const projectsResult = await pool.query(projectsQuery, queryParams);

    // Filter visibility settings for non-admin users
    const projects = projectsResult.rows.map(project => {
      if (!isAdmin && project.visibility_settings) {
        const visibilitySettings = project.visibility_settings;
        Object.keys(visibilitySettings).forEach(key => {
          if (!visibilitySettings[key]) {
            project[key] = null;
          }
        });
      }
      return project;
    });

    res.json({
      projects,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Server error during search' });
  }
});

// Export projects to Excel
router.post('/export', authenticateToken, async (req, res) => {
  try {
    const { projectIds } = req.body;
    const isAdmin = req.user.role === 'admin';

    let query;
    let params;

    if (projectIds && projectIds.length > 0) {
      query = `SELECT * FROM projects WHERE id = ANY($1)`;
      params = [projectIds];
    } else {
      query = `SELECT * FROM projects ${!isAdmin ? 'WHERE is_visible = true' : ''} ORDER BY created_at DESC`;
      params = [];
    }

    const result = await pool.query(query, params);
    const projects = result.rows;

    const workbook = xlsx.utils.book_new();

    const excelData = projects.map(p => ({
      'Project Name': p.project_name,
      'Developer Name': p.developer_name,
      'Location': p.location,
      'Plot Size': p.plot_size,
      'Total Towers': p.total_towers,
      'Total Floors': p.total_floors,
      'Possession': p.possession,
      'Budget Min': p.budget_min,
      'Budget Max': p.budget_max,
      'Carpet Area Min': p.carpet_area_min,
      'Carpet Area Max': p.carpet_area_max,
      'Configurations': p.configurations?.join(', '),
      'Rate psf Min': p.rate_psf_min,
      'Rate psf Max': p.rate_psf_max,
      'Availability Status': p.availability_status,
      'Notes': p.notes,
      'Client Tags': p.client_requirement_tags?.join(', '),
      'Google Maps Link': p.google_maps_link
    }));

    const worksheet = xlsx.utils.json_to_sheet(excelData);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Projects');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=projects-export-${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Server error during export' });
  }
});

// Download Excel template
router.get('/template/download', authenticateToken, (req, res) => {
  try {
    const workbook = xlsx.utils.book_new();

    const templateData = [{
      'Project Name': 'Sample Project',
      'Developer Name': 'Sample Developer',
      'Location': 'Mumbai',
      'Plot Size': '5 Acres',
      'Total Towers': '3',
      'Total Floors': '25',
      'Possession': 'Dec 2025',
      'Budget Min': '5000000',
      'Budget Max': '7500000',
      'Carpet Area Min': '800',
      'Carpet Area Max': '1500',
      'Configurations': '2 BHK, 3 BHK',
      'Rate psf Min': '15000',
      'Rate psf Max': '18000',
      'Availability Status': 'Ready',
      'Notes': 'Limited units available',
      'Client Tags': 'Luxury, Prime Location',
      'Google Maps Link': 'https://maps.google.com/...'
    }];

    const worksheet = xlsx.utils.json_to_sheet(templateData);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Projects');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=projects-template.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({ error: 'Server error during template download' });
  }
});

// Get single project
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';

    const projectQuery = `
      SELECT p.*, 
             json_agg(DISTINCT jsonb_build_object(
               'id', pm.id,
               'media_type', pm.media_type,
               'file_name', pm.file_name,
               'file_path', pm.file_path,
               'configuration', pm.configuration,
               'description', pm.description,
               'is_visible', pm.is_visible
             )) FILTER (WHERE pm.id IS NOT NULL) as media
      FROM projects p
      LEFT JOIN project_media pm ON p.id = pm.project_id ${!isAdmin ? 'AND pm.is_visible = true' : ''}
      WHERE p.id = $1 ${!isAdmin ? 'AND p.is_visible = true' : ''}
      GROUP BY p.id
    `;

    const result = await pool.query(projectQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project: result.rows[0] });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to get unique project name with copy marker
async function getUniqueProjectName(projectName, developerName, location) {
  // Check if exact project exists (same name, developer, location)
  const existing = await pool.query(
    `SELECT project_name FROM projects
     WHERE LOWER(project_name) LIKE LOWER($1)
     AND LOWER(COALESCE(developer_name, '')) = LOWER(COALESCE($2, ''))
     AND LOWER(COALESCE(location, '')) = LOWER(COALESCE($3, ''))
     ORDER BY project_name DESC`,
    [`${projectName}%`, developerName || '', location || '']
  );

  if (existing.rows.length === 0) {
    return projectName;
  }

  // Check if original name (without copy marker) exists
  const exactMatch = existing.rows.find(r =>
    r.project_name.toLowerCase() === projectName.toLowerCase()
  );

  if (!exactMatch) {
    return projectName;
  }

  // Find the highest copy number
  let maxCopyNum = 0;
  const copyPattern = /\(Copy(?:\s+(\d+))?\)$/i;

  for (const row of existing.rows) {
    const match = row.project_name.match(copyPattern);
    if (match) {
      const num = match[1] ? parseInt(match[1]) : 1;
      maxCopyNum = Math.max(maxCopyNum, num);
    }
  }

  // Return name with appropriate copy marker
  if (maxCopyNum === 0) {
    return `${projectName} (Copy)`;
  }
  return `${projectName} (Copy ${maxCopyNum + 1})`;
}

// Create project (manual upload)
router.post('/', authenticateToken, [
  body('project_name').notEmpty().trim(),
  body('budget_min').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }),
  body('budget_max').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }),
  body('configurations').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      project_name,
      developer_name,
      location,
      plot_size,
      total_towers,
      total_floors,
      possession,
      budget_min,
      budget_max,
      carpet_area_min,
      carpet_area_max,
      configurations,
      rate_psf_min,
      rate_psf_max,
      availability_status,
      notes,
      client_requirement_tags,
      google_maps_link
    } = req.body;

    // Get unique project name with copy marker if duplicate
    const uniqueProjectName = await getUniqueProjectName(project_name, developer_name, location);
    const isDuplicate = uniqueProjectName !== project_name;

    const result = await pool.query(
      `INSERT INTO projects (
        project_name, developer_name, location, plot_size,
        total_towers, total_floors, possession,
        budget_min, budget_max, carpet_area_min, carpet_area_max,
        configurations, rate_psf_min, rate_psf_max,
        availability_status, notes, client_requirement_tags,
        google_maps_link, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [
        uniqueProjectName, developer_name, location, plot_size,
        total_towers || null, total_floors || null, possession,
        budget_min, budget_max, carpet_area_min || null, carpet_area_max || null,
        configurations || [], rate_psf_min || null, rate_psf_max || null,
        availability_status || 'Ready', notes,
        client_requirement_tags || [], google_maps_link,
        req.user.id
      ]
    );

    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, 'create', 'project', result.rows[0].id, { project_name: uniqueProjectName, original_name: project_name, is_duplicate: isDuplicate }]
    );

    res.status(201).json({
      message: isDuplicate
        ? `Project created as "${uniqueProjectName}" (duplicate detected)`
        : 'Project created successfully',
      project: result.rows[0],
      isDuplicate
    });
  } catch (error) {
    console.error('Create project error:', error.message, error.stack);
    res.status(500).json({ error: 'Server error during project creation', details: error.message });
  }
});

// Bulk upload via Excel
router.post('/bulk-upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const results = {
      success: 0,
      failed: 0,
      duplicates: 0,
      errors: []
    };

    for (const row of data) {
      try {
        // Map Excel columns to database fields
        const project = {
          project_name: row['Project Name'] || row.project_name,
          developer_name: row['Developer Name'] || row.developer_name,
          location: row['Location'] || row.location,
          plot_size: row['Plot Size'] || row.plot_size,
          total_towers: parseInt(row['Total Towers'] || row.total_towers) || null,
          total_floors: row['Total Floors'] || row.total_floors || null,
          possession: row['Possession'] || row.possession,
          budget_min: parseFloat(row['Budget Min'] || row.budget_min) || null,
          budget_max: parseFloat(row['Budget Max'] || row.budget_max) || null,
          carpet_area_min: parseInt(row['Carpet Area Min'] || row.carpet_area_min) || null,
          carpet_area_max: parseInt(row['Carpet Area Max'] || row.carpet_area_max) || null,
          configurations: (row['Configurations'] || row.configurations)?.split(',').map(c => c.trim()) || [],
          rate_psf_min: parseFloat(row['Rate psf Min'] || row.rate_psf_min) || null,
          rate_psf_max: parseFloat(row['Rate psf Max'] || row.rate_psf_max) || null,
          availability_status: row['Availability Status'] || row.availability_status || 'Ready',
          notes: row['Notes'] || row.notes,
          client_requirement_tags: (row['Client Tags'] || row.client_requirement_tags)?.split(',').map(t => t.trim()) || [],
          google_maps_link: row['Google Maps Link'] || row.google_maps_link
        };

        if (!project.project_name) {
          results.failed++;
          results.errors.push({ row: results.success + results.failed + results.duplicates, error: 'Project name is required' });
          continue;
        }

        // Get unique project name with copy marker if duplicate
        const uniqueProjectName = await getUniqueProjectName(
          project.project_name,
          project.developer_name,
          project.location
        );
        const isDuplicate = uniqueProjectName !== project.project_name;

        await pool.query(
          `INSERT INTO projects (
            project_name, developer_name, location, plot_size,
            total_towers, total_floors, possession,
            budget_min, budget_max, carpet_area_min, carpet_area_max,
            configurations, rate_psf_min, rate_psf_max,
            availability_status, notes, client_requirement_tags,
            google_maps_link, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
          [
            uniqueProjectName, project.developer_name, project.location,
            project.plot_size, project.total_towers, project.total_floors,
            project.possession, project.budget_min, project.budget_max,
            project.carpet_area_min, project.carpet_area_max, project.configurations,
            project.rate_psf_min, project.rate_psf_max, project.availability_status,
            project.notes, project.client_requirement_tags,
            project.google_maps_link, req.user.id
          ]
        );

        results.success++;
        if (isDuplicate) {
          results.duplicates++;
        }
      } catch (err) {
        results.failed++;
        results.errors.push({ row: results.success + results.failed + results.duplicates, error: err.message });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    console.log('Bulk upload results:', JSON.stringify(results, null, 2));

    res.json({
      message: 'Bulk upload completed',
      results
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: 'Server error during bulk upload',
      details: error.message
    });
  }
});

// Upload media files for a project
router.post('/:id/media', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { media_type, configuration, description } = req.body;

    // Verify project exists
    const projectCheck = await pool.query('SELECT id FROM projects WHERE id = $1', [id]);
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const uploadedMedia = [];

    for (const file of req.files) {
      const result = await pool.query(
        `INSERT INTO project_media (
          project_id, media_type, file_name, file_path, file_size,
          configuration, description, uploaded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          id, media_type || 'image', file.originalname, file.filename,
          file.size, configuration, description, req.user.id
        ]
      );
      uploadedMedia.push(result.rows[0]);
    }

    res.status(201).json({
      message: 'Media uploaded successfully',
      media: uploadedMedia
    });
  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({ error: 'Server error during media upload' });
  }
});

// Update project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const allowedFields = [
      'project_name', 'developer_name', 'location', 'plot_size',
      'total_towers', 'total_floors', 'possession',
      'budget_min', 'budget_max', 'carpet_area_min', 'carpet_area_max',
      'configurations', 'rate_psf_min', 'rate_psf_max',
      'availability_status', 'notes', 'client_requirement_tags',
      'google_maps_link', 'is_visible', 'visibility_settings'
    ];

    // Admin-only fields - attribute fields for Additional Details
    const adminOnlyFields = [
      'attribute_1', 'attribute_2', 'attribute_3', 'attribute_4', 'attribute_5',
      'attribute_6', 'attribute_7', 'attribute_8', 'attribute_9', 'attribute_10',
      'attribute_11', 'attribute_12', 'attribute_13'
    ];

    const updateFields = [];
    const values = [];
    let paramCount = 0;

    // Regular fields - all users can edit
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        paramCount++;
        updateFields.push(`${field} = $${paramCount}`);
        values.push(updates[field]);
      }
    }

    // Admin-only fields - only admins can edit
    if (req.user.role === 'admin') {
      for (const field of adminOnlyFields) {
        if (updates[field] !== undefined) {
          paramCount++;
          updateFields.push(`${field} = $${paramCount}`);
          values.push(updates[field]);
        }
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    paramCount++;
    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE projects SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Project updated successfully',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error during update' });
  }
});

// Toggle visibility settings (Admin only)
router.patch('/:id/visibility', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { field, visible, projectVisible } = req.body;

    if (projectVisible !== undefined) {
      // Toggle entire project visibility
      await pool.query(
        'UPDATE projects SET is_visible = $1, updated_at = NOW() WHERE id = $2',
        [projectVisible, id]
      );
    }

    if (field) {
      // Update specific field visibility
      const result = await pool.query(
        `UPDATE projects 
         SET visibility_settings = jsonb_set(
           COALESCE(visibility_settings, '{}'::jsonb),
           $1,
           $2::jsonb
         ),
         updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [`{${field}}`, JSON.stringify(visible), id]
      );

      return res.json({
        message: 'Visibility updated',
        project: result.rows[0]
      });
    }

    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    res.json({
      message: 'Visibility updated',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Visibility update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle media visibility (Admin only)
router.patch('/media/:mediaId/visibility', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { visible } = req.body;

    const result = await pool.query(
      'UPDATE project_media SET is_visible = $1 WHERE id = $2 RETURNING *',
      [visible, mediaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json({
      message: 'Media visibility updated',
      media: result.rows[0]
    });
  } catch (error) {
    console.error('Media visibility error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete project
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete associated media files
    const mediaResult = await pool.query(
      'SELECT file_path FROM project_media WHERE project_id = $1',
      [id]
    );

    for (const media of mediaResult.rows) {
      const filePath = path.join(__dirname, '../uploads', media.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.query('DELETE FROM projects WHERE id = $1', [id]);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error during deletion' });
  }
});

// Bulk delete projects (Admin only)
router.post('/bulk-delete', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { projectIds } = req.body;

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ error: 'No projects selected for deletion' });
    }

    let deletedCount = 0;
    const errors = [];

    for (const id of projectIds) {
      try {
        // Delete associated media files
        const mediaResult = await pool.query(
          'SELECT file_path FROM project_media WHERE project_id = $1',
          [id]
        );

        for (const media of mediaResult.rows) {
          const filePath = path.join(__dirname, '../uploads', media.file_path);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }

        await pool.query('DELETE FROM projects WHERE id = $1', [id]);
        deletedCount++;
      } catch (err) {
        errors.push({ projectId: id, error: err.message });
      }
    }

    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, 'bulk_delete', 'projects', null, { deleted_count: deletedCount, project_ids: projectIds }]
    );

    res.json({
      message: `Successfully deleted ${deletedCount} project(s)`,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Server error during bulk deletion' });
  }
});

// Download media file
router.get('/media/:mediaId/download', async (req, res) => {
  try {
    const { mediaId } = req.params;

    const result = await pool.query(
      'SELECT file_name, file_path FROM project_media WHERE id = $1',
      [mediaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const { file_name, file_path } = result.rows[0];
    const fullPath = path.join(__dirname, '../uploads', file_path);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(fullPath, file_name);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Server error during download' });
  }
});

// Delete media file
router.delete('/media/:mediaId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { mediaId } = req.params;

    // Get file path before deleting
    const result = await pool.query(
      'SELECT file_path FROM project_media WHERE id = $1',
      [mediaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const { file_path } = result.rows[0];
    const fullPath = path.join(__dirname, '../uploads', file_path);

    // Delete from database
    await pool.query('DELETE FROM project_media WHERE id = $1', [mediaId]);

    // Delete file from disk
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Server error during deletion' });
  }
});

// Get similar/recommended projects
router.get('/:id/similar', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';

    // Get the current project
    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];

    // Find similar projects based on location, budget range, and configurations
    const similarQuery = `
      SELECT p.*,
             (
               CASE WHEN location ILIKE $2 THEN 30 ELSE 0 END +
               CASE WHEN configurations && $3 THEN 25 ELSE 0 END +
               CASE WHEN budget_min <= $5 AND budget_max >= $4 THEN 25 ELSE 0 END +
               CASE WHEN developer_name = $6 THEN 10 ELSE 0 END +
               CASE WHEN client_requirement_tags && $7 THEN 10 ELSE 0 END
             ) as similarity_score
      FROM projects p
      WHERE p.id != $1 ${!isAdmin ? 'AND p.is_visible = true' : ''}
      ORDER BY similarity_score DESC, created_at DESC
      LIMIT 5
    `;

    const result = await pool.query(similarQuery, [
      id,
      `%${project.location ? project.location.split(',')[0] : ''}%`,
      project.configurations || [],
      project.budget_min || 0,
      project.budget_max || 999999999,
      project.developer_name,
      project.client_requirement_tags || []
    ]);

    res.json({ similar_projects: result.rows });
  } catch (error) {
    console.error('Similar projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
