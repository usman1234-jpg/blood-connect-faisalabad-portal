
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    blood_type TEXT,
    university TEXT,
    graduation_year INTEGER,
    amount REAL DEFAULT 0,
    donation_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_donors_name ON donors(name);
  CREATE INDEX IF NOT EXISTS idx_donors_university ON donors(university);
  CREATE INDEX IF NOT EXISTS idx_donors_blood_type ON donors(blood_type);
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`);

// User operations
const insertUser = db.prepare(`
  INSERT INTO users (username, email, password_hash, role)
  VALUES (?, ?, ?, ?)
`);

const getUserByUsername = db.prepare(`
  SELECT * FROM users WHERE username = ?
`);

const getUserByEmail = db.prepare(`
  SELECT * FROM users WHERE email = ?
`);

const getUserById = db.prepare(`
  SELECT * FROM users WHERE id = ?
`);

const updateUser = db.prepare(`
  UPDATE users 
  SET username = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const deleteUser = db.prepare(`
  DELETE FROM users WHERE id = ?
`);

const getAllUsers = db.prepare(`
  SELECT id, username, email, role, created_at, updated_at FROM users
`);

// Donor operations
const insertDonor = db.prepare(`
  INSERT INTO donors (name, email, phone, blood_type, university, graduation_year, amount, donation_date, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getDonorById = db.prepare(`
  SELECT * FROM donors WHERE id = ?
`);

const getAllDonors = db.prepare(`
  SELECT * FROM donors ORDER BY created_at DESC
`);

const updateDonor = db.prepare(`
  UPDATE donors 
  SET name = ?, email = ?, phone = ?, blood_type = ?, university = ?, graduation_year = ?, amount = ?, donation_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const deleteDonor = db.prepare(`
  DELETE FROM donors WHERE id = ?
`);

const searchDonors = db.prepare(`
  SELECT * FROM donors 
  WHERE name LIKE ? OR university LIKE ? OR blood_type LIKE ?
  ORDER BY created_at DESC
`);

const getDonorsByUniversity = db.prepare(`
  SELECT * FROM donors WHERE university = ? ORDER BY created_at DESC
`);

const getDonorStats = db.prepare(`
  SELECT 
    COUNT(*) as total_donors,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount,
    COUNT(DISTINCT university) as universities_count
  FROM donors
`);

export const storage = {
  // User methods
  insertUser: (user: { username: string; email: string; password_hash: string; role?: string }) => {
    try {
      const result = insertUser.run(user.username, user.email, user.password_hash, user.role || 'user');
      return { id: result.lastInsertRowid, ...user };
    } catch (error) {
      throw new Error(`Failed to insert user: ${error}`);
    }
  },

  getUserByUsername: (username: string) => {
    return getUserByUsername.get(username);
  },

  getUserByEmail: (email: string) => {
    return getUserByEmail.get(email);
  },

  getUserById: (id: number) => {
    return getUserById.get(id);
  },

  updateUser: (id: number, user: { username: string; email: string; role: string }) => {
    try {
      updateUser.run(user.username, user.email, user.role, id);
      return getUserById.get(id);
    } catch (error) {
      throw new Error(`Failed to update user: ${error}`);
    }
  },

  deleteUser: (id: number) => {
    try {
      const result = deleteUser.run(id);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error}`);
    }
  },

  getAllUsers: () => {
    return getAllUsers.all();
  },

  // Donor methods
  insertDonor: (donor: {
    name: string;
    email?: string;
    phone?: string;
    blood_type?: string;
    university?: string;
    graduation_year?: number;
    amount?: number;
    donation_date?: string;
    notes?: string;
  }) => {
    try {
      const result = insertDonor.run(
        donor.name,
        donor.email || null,
        donor.phone || null,
        donor.blood_type || null,
        donor.university || null,
        donor.graduation_year || null,
        donor.amount || 0,
        donor.donation_date || null,
        donor.notes || null
      );
      return { id: result.lastInsertRowid, ...donor };
    } catch (error) {
      throw new Error(`Failed to insert donor: ${error}`);
    }
  },

  getDonorById: (id: number) => {
    return getDonorById.get(id);
  },

  getAllDonors: () => {
    return getAllDonors.all();
  },

  updateDonor: (id: number, donor: {
    name: string;
    email?: string;
    phone?: string;
    blood_type?: string;
    university?: string;
    graduation_year?: number;
    amount?: number;
    donation_date?: string;
    notes?: string;
  }) => {
    try {
      updateDonor.run(
        donor.name,
        donor.email || null,
        donor.phone || null,
        donor.blood_type || null,
        donor.university || null,
        donor.graduation_year || null,
        donor.amount || 0,
        donor.donation_date || null,
        donor.notes || null,
        id
      );
      return getDonorById.get(id);
    } catch (error) {
      throw new Error(`Failed to update donor: ${error}`);
    }
  },

  deleteDonor: (id: number) => {
    try {
      const result = deleteDonor.run(id);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete donor: ${error}`);
    }
  },

  searchDonors: (query: string) => {
    const searchTerm = `%${query}%`;
    return searchDonors.all(searchTerm, searchTerm, searchTerm);
  },

  getDonorsByUniversity: (university: string) => {
    return getDonorsByUniversity.all(university);
  },

  getDonorStats: () => {
    return getDonorStats.get();
  },

  // Utility method to close database connection
  close: () => {
    db.close();
  }
};
