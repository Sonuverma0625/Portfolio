/**
 * Seed script - refreshes db.json using the current portfolio content.
 * Run: node scripts/seed.js
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');
const seedData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

seedData.messages = [];
seedData.analytics = {
  total_visits: 0,
  contact_submissions: 0,
  last_updated: new Date().toISOString()
};

fs.writeFileSync(DB_PATH, JSON.stringify(seedData, null, 2), 'utf-8');
console.log('Database seeded successfully at:', DB_PATH);
