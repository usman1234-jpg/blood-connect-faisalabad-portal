
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, like, or } from "drizzle-orm";
import { users, donors, type InsertUser, type User, type InsertDonor, type Donor } from "../shared/schema";
import * as bcrypt from "bcrypt";

const sqlite = new Database("./database.sqlite");
const db = drizzle(sqlite);

// Initialize tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    blood_type TEXT,
    address TEXT,
    university TEXT,
    last_donation TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

export const storage = {
  // User operations
  async insertUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const result = await db.insert(users).values({
      ...userData,
      password: hashedPassword,
    }).returning();
    return result[0];
  },

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] || null;
  },

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  },

  // Donor operations
  async insertDonor(donorData: InsertDonor): Promise<Donor> {
    const result = await db.insert(donors).values(donorData).returning();
    return result[0];
  },

  async getAllDonors(): Promise<Donor[]> {
    return db.select().from(donors);
  },

  async getDonorById(id: number): Promise<Donor | null> {
    const result = await db.select().from(donors).where(eq(donors.id, id));
    return result[0] || null;
  },

  async updateDonor(id: number, donorData: Partial<InsertDonor>): Promise<Donor | null> {
    const result = await db.update(donors).set(donorData).where(eq(donors.id, id)).returning();
    return result[0] || null;
  },

  async deleteDonor(id: number): Promise<boolean> {
    const result = await db.delete(donors).where(eq(donors.id, id));
    return result.changes > 0;
  },

  async searchDonors(query: string): Promise<Donor[]> {
    return db.select().from(donors).where(
      or(
        like(donors.name, `%${query}%`),
        like(donors.email, `%${query}%`),
        like(donors.phone, `%${query}%`),
        like(donors.bloodType, `%${query}%`),
        like(donors.university, `%${query}%`)
      )
    );
  },

  async getDonorsByBloodType(bloodType: string): Promise<Donor[]> {
    return db.select().from(donors).where(eq(donors.bloodType, bloodType));
  },

  async getDonorsByUniversity(university: string): Promise<Donor[]> {
    return db.select().from(donors).where(eq(donors.university, university));
  },

  async insertMultipleDonors(donorsData: InsertDonor[]): Promise<Donor[]> {
    const results = [];
    for (const donorData of donorsData) {
      const result = await db.insert(donors).values(donorData).returning();
      results.push(result[0]);
    }
    return results;
  }
};
