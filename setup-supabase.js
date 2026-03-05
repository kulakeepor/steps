// Use Supabase v1 Management API
const PROJECT_REF = 'kwzgjxwejjvzmtnrxeph';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3emdqeHdlamp2em10bnJ4ZXBoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU5NzY5OSwiZXhwIjoyMDg4MTczNjk5fQ.jwYcMZ_AFmV6_CvYcqB_YG9GOxH88HW99ClDWbfWAUA';

const tables = [
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'USER', steps INTEGER NOT NULL DEFAULT 0, status BOOLEAN NOT NULL DEFAULT TRUE, loginAttempts INTEGER NOT NULL DEFAULT 0, lockUntil TIMESTAMP, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, deleted BOOLEAN NOT NULL DEFAULT FALSE)`,
  `CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, stepsReward INTEGER NOT NULL, sortOrder INTEGER NOT NULL, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS task_submissions (id TEXT PRIMARY KEY, userId TEXT NOT NULL, taskId TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'PENDING', submittedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, reviewedAt TIMESTAMP, reviewedBy TEXT, FOREIGN KEY (userId) REFERENCES users(id), FOREIGN KEY (taskId) REFERENCES tasks(id), UNIQUE(userId, taskId))`,
  `CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT NOT NULL, image TEXT NOT NULL, stepsPrice INTEGER NOT NULL, stock INTEGER NOT NULL, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, deleted BOOLEAN NOT NULL DEFAULT FALSE)`,
  `CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, userId TEXT NOT NULL, productId TEXT NOT NULL, stepsCost INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'PENDING', submittedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, reviewedAt TIMESTAMP, shippedAt TIMESTAMP, completedAt TIMESTAMP, FOREIGN KEY (userId) REFERENCES users(id), FOREIGN KEY (productId) REFERENCES products(id))`,
  `CREATE TABLE IF NOT EXISTS wishes (id TEXT PRIMARY KEY, userId TEXT NOT NULL, itemName TEXT NOT NULL, stepsCost INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'PENDING', submittedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, reviewedAt TIMESTAMP, reviewedBy TEXT, FOREIGN KEY (userId) REFERENCES users(id))`,
  `CREATE TABLE IF NOT EXISTS step_transactions (id TEXT PRIMARY KEY, userId TEXT NOT NULL, amount INTEGER NOT NULL, type TEXT NOT NULL, description TEXT NOT NULL, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES users(id))`,
  `CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, userId TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'INFO', read BOOLEAN NOT NULL DEFAULT FALSE, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES users(id))`
];

async function executeSQL(sql) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  return response.json();
}

async function setupDatabase() {
  console.log('Setting up Supabase database...\n');
  
  for (const sql of tables) {
    try {
      const result = await executeSQL(sql);
      console.log('✓ Success:', result);
    } catch (err) {
      console.log('?', err.message.substring(0, 100));
    }
  }
  
  console.log('\nDone!');
}

setupDatabase().catch(console.error);
