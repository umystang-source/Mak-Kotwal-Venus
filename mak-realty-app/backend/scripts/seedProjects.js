const { pool } = require('../config/database');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// South Mumbai areas and neighborhoods
const southMumbaiLocations = [
  'Colaba', 'Cuffe Parade', 'Nariman Point', 'Marine Drive', 'Churchgate',
  'Fort', 'Malabar Hill', 'Walkeshwar', 'Breach Candy', 'Pedder Road',
  'Kemps Corner', 'Nepean Sea Road', 'Altamount Road', 'Cumballa Hill',
  'Mahalaxmi', 'Worli', 'Lower Parel', 'Prabhadevi', 'Tardeo', 'Grant Road'
];

// Prominent South Mumbai developers
const developers = [
  'Lodha Group', 'Raheja Universal', 'Godrej Properties', 'Oberoi Realty',
  'Hiranandani Group', 'Rustomjee', 'Shapoorji Pallonji', 'Piramal Realty',
  'Omkar Realtors', 'Indiabulls Real Estate', 'Kalpataru', 'Wadhwa Group',
  'Marathon Group', 'Runwal Group', 'DB Realty', 'SD Corp', 'Sheth Creators',
  'Tata Housing', 'L&T Realty', 'Mahindra Lifespaces'
];

// Project name prefixes
const projectPrefixes = [
  'The World Towers', 'Sea View Heights', 'Imperial Heights', 'The Crown',
  'Royal Residency', 'Palazzo', 'Grand Bay', 'The Signature', 'Sea Face',
  'Marina Bay', 'The Peninsula', 'Ocean Crest', 'Sky Gardens', 'Azure',
  'The Residences', 'Elysium', 'Bellissimo', 'Altissimo', 'Primero', 'Infiniti',
  'One', 'Tower', 'Heights', 'Enclave', 'Luxuria'
];

// Configuration options
const configurations = ['2 BHK', '3 BHK', '4 BHK', '5 BHK'];

// Availability statuses
const availabilityStatuses = ['Ready to Move', 'Under Construction', 'New Launch', 'Pre-Launch'];

// Possession timelines
const possessionTimelines = [
  'Ready Possession', 'Dec 2024', 'Mar 2025', 'Jun 2025', 'Dec 2025',
  'Mar 2026', 'Jun 2026', 'Dec 2026', 'Mar 2027', 'Dec 2027'
];

// Client requirement tags
const clientTags = [
  'Sea View', 'Premium', 'Luxury', 'Ultra Luxury', 'Investment',
  'Family', 'NRI', 'HNWI', 'Celebrity', 'Expat', 'Duplex', 'Penthouse',
  'Garden', 'Pool View', 'City View', 'Heritage', 'Boutique', 'High Floor'
];

// Generate random number between min and max
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Pick random items from array
const pickRandom = (arr, count = 1) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return count === 1 ? shuffled[0] : shuffled.slice(0, count);
};

// Generate South Mumbai project data
const generateProject = (index) => {
  const location = pickRandom(southMumbaiLocations);
  const developer = pickRandom(developers);
  const prefix = pickRandom(projectPrefixes);

  // South Mumbai has premium pricing - ₹50,000 to ₹1,50,000 per sq ft
  const ratePsfMin = randomBetween(50000, 90000);
  const ratePsfMax = ratePsfMin + randomBetween(10000, 60000);

  // Carpet areas typical for South Mumbai luxury apartments
  const carpetAreaMin = randomBetween(800, 2000);
  const carpetAreaMax = carpetAreaMin + randomBetween(500, 2000);

  // Budget calculation based on carpet area and rate
  const budgetMin = Math.round((carpetAreaMin * ratePsfMin) / 10000000) * 100; // In lakhs
  const budgetMax = Math.round((carpetAreaMax * ratePsfMax) / 10000000) * 100; // In lakhs

  // Pick 2-4 configurations
  const numConfigs = randomBetween(2, 4);
  const projectConfigs = pickRandom(configurations, numConfigs).sort();

  // Pick 2-5 client tags
  const numTags = randomBetween(2, 5);
  const projectTags = pickRandom(clientTags, numTags);

  const totalTowers = randomBetween(1, 4);
  const totalFloors = randomBetween(20, 70);
  const plotSize = `${randomBetween(1, 5)}.${randomBetween(0, 9)} acres`;

  // Generate Additional Details (13 attributes)
  const elevatorTypes = ['High-speed', 'Panoramic', 'Service + Passenger', 'VRV enabled'];
  const permissionTypes = ['OC Received', 'Commencement Certificate', 'IOD Approved', 'RERA Registered'];
  const paymentDueOptions = ['10:90', '20:80', '30:70', 'Construction Linked', 'Flexi Payment'];
  const carParkTypes = ['Stacked', 'Podium', 'Basement', 'Mechanical'];
  const apartmentTypes = ['Simplex', 'Duplex', 'Triplex', 'Penthouse'];
  const constructionStatuses = ['Foundation', 'Podium Level', 'Mid-rise', 'Nearing Completion', 'Ready'];

  return {
    project_name: `${prefix} ${location}`,
    developer_name: developer,
    location: `${location}, South Mumbai`,
    plot_size: plotSize,
    total_towers: totalTowers,
    total_floors: totalFloors,
    possession: pickRandom(possessionTimelines),
    budget_min: budgetMin * 100000, // Convert lakhs to rupees
    budget_max: budgetMax * 100000,
    carpet_area_min: carpetAreaMin,
    carpet_area_max: carpetAreaMax,
    configurations: projectConfigs,
    rate_psf_min: ratePsfMin,
    rate_psf_max: ratePsfMax,
    availability_status: pickRandom(availabilityStatuses),
    notes: generateNotes(location, developer, projectConfigs),
    client_requirement_tags: projectTags,
    google_maps_link: `https://maps.google.com/?q=${encodeURIComponent(location + ', Mumbai')}`,
    is_visible: true,
    // Additional Details (13 attributes)
    attribute_1: `${randomBetween(2, 6)} apartments`,  // Apartments Per Floor
    attribute_2: `${randomBetween(2, 6)} ${pickRandom(elevatorTypes)}`,  // Elevator
    attribute_3: `${randomBetween(50, 400)} apartments`,  // Apartments In The Project
    attribute_4: `${randomBetween(3000, 15000)} sq ft`,  // Floor Plate
    attribute_5: `${randomBetween(10, 14)} ft`,  // Apartment Height
    attribute_6: `${randomBetween(3, 12)}th floor`,  // First Habitable Floor
    attribute_7: pickRandom(permissionTypes),  // Permissions
    attribute_8: pickRandom(paymentDueOptions),  // Payment Due
    attribute_9: `₹${randomBetween(50, 200)}/sq ft`,  // Floor Rise
    attribute_10: `${randomBetween(1, 3)} ${pickRandom(carParkTypes)}`,  // Car Park
    attribute_11: `₹${randomBetween(15, 50)}/sq ft`,  // Maintenance Charges
    attribute_12: pickRandom(apartmentTypes),  // Apartment Type
    attribute_13: pickRandom(constructionStatuses)  // Construction Status
  };
};

// Generate project notes
const generateNotes = (location, developer, configs) => {
  const features = [
    'World-class amenities including infinity pool, spa, and gymnasium',
    'Stunning sea views from upper floors',
    'Premium Italian marble flooring throughout',
    'Smart home automation in all apartments',
    'Private lift lobby for each apartment',
    'Designer modular kitchen with imported fittings',
    'Concierge services and 24x7 security',
    'Dedicated parking with EV charging points',
    'Landscaped podium garden with jogging track',
    'Private theater and business center'
  ];

  const selectedFeatures = pickRandom(features, 3);
  return `${developer} presents a luxurious development in the heart of ${location}. ` +
    `Available in ${configs.join(', ')} configurations. ` +
    `${selectedFeatures.join('. ')}. ` +
    `Perfect for discerning buyers seeking premium living in South Mumbai.`;
};

// Main seed function
const seedProjects = async () => {
  try {
    console.log('🌱 Starting to seed 50 South Mumbai projects...\n');

    // Check if there's at least one user to set as creator
    const userResult = await pool.query('SELECT id FROM users LIMIT 1');
    const createdBy = userResult.rows.length > 0 ? userResult.rows[0].id : null;

    // Clear existing projects (optional - comment out if you want to keep existing)
    console.log('🗑️  Clearing existing projects...');
    await pool.query('DELETE FROM project_media');
    await pool.query('DELETE FROM projects');
    console.log('✅ Existing projects cleared.\n');

    // Generate and insert 50 projects
    const projects = [];
    for (let i = 1; i <= 50; i++) {
      const project = generateProject(i);
      projects.push(project);
    }

    // Insert projects
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];

      await pool.query(
        `INSERT INTO projects (
          project_name, developer_name, location, plot_size, total_towers, total_floors,
          possession, budget_min, budget_max, carpet_area_min, carpet_area_max,
          configurations, rate_psf_min, rate_psf_max, availability_status,
          notes, client_requirement_tags, google_maps_link, is_visible, created_by,
          attribute_1, attribute_2, attribute_3, attribute_4, attribute_5,
          attribute_6, attribute_7, attribute_8, attribute_9, attribute_10,
          attribute_11, attribute_12, attribute_13
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                  $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)`,
        [
          p.project_name, p.developer_name, p.location, p.plot_size, p.total_towers,
          p.total_floors, p.possession, p.budget_min, p.budget_max, p.carpet_area_min,
          p.carpet_area_max, p.configurations, p.rate_psf_min, p.rate_psf_max,
          p.availability_status, p.notes, p.client_requirement_tags, p.google_maps_link,
          p.is_visible, createdBy,
          p.attribute_1, p.attribute_2, p.attribute_3, p.attribute_4, p.attribute_5,
          p.attribute_6, p.attribute_7, p.attribute_8, p.attribute_9, p.attribute_10,
          p.attribute_11, p.attribute_12, p.attribute_13
        ]
      );

      console.log(`✅ [${i + 1}/50] Created: ${p.project_name}`);
    }

    console.log('\n🎉 Successfully seeded 50 South Mumbai projects!');
    console.log('\n📊 Summary:');

    // Print summary
    const countResult = await pool.query('SELECT COUNT(*) as count FROM projects');
    console.log(`   Total projects in database: ${countResult.rows[0].count}`);

    const locationStats = await pool.query(`
      SELECT location, COUNT(*) as count
      FROM projects
      GROUP BY location
      ORDER BY count DESC
      LIMIT 5
    `);
    console.log('\n   Top 5 locations:');
    locationStats.rows.forEach(row => {
      console.log(`   - ${row.location}: ${row.count} projects`);
    });

    const developerStats = await pool.query(`
      SELECT developer_name, COUNT(*) as count
      FROM projects
      GROUP BY developer_name
      ORDER BY count DESC
      LIMIT 5
    `);
    console.log('\n   Top 5 developers:');
    developerStats.rows.forEach(row => {
      console.log(`   - ${row.developer_name}: ${row.count} projects`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding projects:', error);
    process.exit(1);
  }
};

// Run the seed function
seedProjects();
