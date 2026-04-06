import Database from 'better-sqlite3';
import path from 'path';

// Define the database path (production-grade persistence)
const DB_PATH = path.join(process.cwd(), 'arcanum_vault.db');

const db = new Database(DB_PATH, { verbose: console.log });

// Enable WAL mode for high-performance concurrent access
db.pragma('journal_mode = WAL');

/**
 * PRODUCTION-GRADE SCHEMA INITIALIZATION
 * Everything is stored. Nothing is deleted.
 */
export function initDB() {
  // 1. SYSTEM LOGS TABLE (Phase 2)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      userId TEXT,
      action TEXT,
      provider TEXT,
      input TEXT,
      output TEXT,
      error TEXT,
      latency INTEGER
    )
  `).run();

  // 2. USER MISSION HISTORY TABLE (Phase 3)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      userId TEXT,
      query TEXT,
      rounds_json TEXT, -- Serialized JSON of all 4 rounds
      final_decision TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // 3. CHAT SESSIONS TABLE
  db.prepare(`
    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      userId TEXT,
      tool TEXT,
      messages_json TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // 4. FAILURE INTELLIGENCE TABLE (Phase 4)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS failure_intelligence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern_id TEXT,
      category TEXT,
      reason TEXT,
      failure_rate REAL,
      common_mistakes TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // 5. USER INTELLIGENCE TABLE
  db.prepare(`
    CREATE TABLE IF NOT EXISTS user_intel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT,
      goal TEXT,
      location TEXT,
      budget TEXT,
      intent TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  console.log("ARCANUM VAULT: Database initialized successfully.");
}

/**
 * QUERIES FAILURE DATA FOR THE MODERATOR
 */
export function getFailureRisks(goal: string) {
  // Simple keyword matching for risk context
  const terms = goal.split(' ').filter(t => t.length > 3);
  if (terms.length === 0) return [];

  const placeholders = terms.map(() => 'reason LIKE ?').join(' OR ');
  const params = terms.map(t => `%${t}%`);

  try {
    return db.prepare(`
      SELECT reason, failure_rate, common_mistakes 
      FROM failure_intelligence 
      WHERE ${placeholders} 
      LIMIT 3
    `).all(...params);
  } catch (e) {
    return [];
  }
}

// Initialize on import
initDB();

export default db;
