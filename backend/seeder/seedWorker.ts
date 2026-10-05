/**
 * Seed script: 20 workers across users -> worker_profiles -> worker_services
 *
 * Usage:
 *   npm install pg bcrypt dotenv
 *   npm install -D typescript ts-node @types/pg @types/bcrypt @types/node
 *   npx ts-node seedWorkers.ts
 *
 * Requires a .env file (or env vars) with DATABASE_URL, e.g.:
 *   DATABASE_URL=postgres://user:password@localhost:5432/yourdb
 */
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
const { Pool } = pg;
type PoolClient = pg.PoolClient; 
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ---------------------------------------------------------------------
// Config / seed data
// ---------------------------------------------------------------------

const WORKER_NAMES = [
  "Ravi Kumar", "Anita Sharma", "Suresh Patel", "Priya Nair", "Vikram Singh",
  "Meena Iyer", "Arjun Mehta", "Kavita Rao", "Rohit Verma", "Sneha Joshi",
  "Manish Gupta", "Divya Menon", "Sanjay Reddy", "Pooja Desai", "Amit Shah",
  "Neha Kapoor", "Deepak Yadav", "Shreya Pillai", "Karan Malhotra", "Ritu Chawla",
];

const EMPLOYMENT_TYPES = ["full_time", "part_time"] as const;

const SERVICE_TYPES: { name: string; description: string }[] = [
  { name: "Plumbing", description: "Pipe fitting, leak repair, and drainage work" },
  { name: "Electrical", description: "Wiring, fixture installation, and electrical repairs" },
  { name: "Cleaning", description: "Home and office cleaning services" },
  { name: "Carpentry", description: "Furniture repair, custom woodwork, and installations" },
  { name: "Painting", description: "Interior and exterior painting" },
  { name: "Gardening", description: "Lawn care, landscaping, and plant maintenance" },
  { name: "HVAC", description: "Heating, ventilation, and air conditioning repair" },
  { name: "Appliance Repair", description: "Repair of household and kitchen appliances" },
];

// Surat, Gujarat center point
const SURAT_LAT = 21.1702;
const SURAT_LNG = 72.8311;
const SPREAD = 0.2; // ~ +/-20km jitter

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomFloat(min, max + 1));
}

function pick<T>(arr: readonly T[]): T {
  const item = arr[Math.floor(Math.random() * arr.length)];
  if (item === undefined) {
    throw new Error("pick() called with an empty array");
  }
  return item;
}

function randomTime(baseHour: number, jitterHours: number): string {
  const hour = baseHour + randomInt(0, jitterHours);
  return `${String(hour).padStart(2, "0")}:00:00`;
}

function emailFor(name: string, index: number): string {
  return `${name.toLowerCase().replace(/\s+/g, ".")}${index}@example.com`;
}

function phoneFor(): string {
  return `9${randomInt(100000000, 999999999)}`;
}

// ---------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------

async function seedServiceTypes(client: PoolClient): Promise<string[]> {
  const ids: string[] = [];

  for (const svc of SERVICE_TYPES) {
    // Insert only if a service type with this name doesn't already exist
    const existing = await client.query<{ id: string }>(
      `SELECT id FROM service_types WHERE name = $1`,
      [svc.name]
    );

    if (existing.rows.length > 0) {
      ids.push(existing.rows[0]!.id);
      continue;
    }

    const inserted = await client.query<{ id: string }>(
      `INSERT INTO service_types (name, description)
       VALUES ($1, $2)
       RETURNING id`,
      [svc.name, svc.description]
    );
    ids.push(inserted.rows[0]!.id);
  }

  return ids;
}

async function seedWorker(client: PoolClient, serviceTypeIds: string[]): Promise<void> {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  for (let i = 0; i < WORKER_NAMES.length; i++) {
    const name = WORKER_NAMES[i];
    const email = emailFor(name!, i + 1);

    // 1. Insert user
    const userResult = await client.query<{ id: string }>(
      `INSERT INTO users (name, email, phone, password_hash, role, is_active, auth_provider)
       VALUES ($1, $2, $3, $4, 'worker', true, 'local')
       RETURNING id`,
      [name, email, phoneFor(), passwordHash]
    );
    const userId = userResult.rows[0]!.id;

    // 2. Insert worker_profile
    const lat = SURAT_LAT + (Math.random() - 0.5) * SPREAD;
    const lng = SURAT_LNG + (Math.random() - 0.5) * SPREAD;

    const profileResult = await client.query<{ id: string }>(
      `INSERT INTO worker_profiles (
         user_id, employment_type, hours_per_week, hourly_rate,
         latitude, longitude, service_radius_km,
         available_from, available_to, is_verified, rating_avg
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        userId,
        pick(EMPLOYMENT_TYPES),
        randomInt(20, 44),
        randomFloat(150, 1000).toFixed(2),
        lat,
        lng,
        randomInt(5, 25),
        randomTime(8, 3),
        randomTime(17, 3),
        Math.random() > 0.4,
        randomFloat(0, 5).toFixed(2),
      ]
    );
    const workerId = profileResult.rows[0]!.id;

    // 3. Assign 1-3 random distinct service types
    const shuffled = [...serviceTypeIds].sort(() => Math.random() - 0.5);
    const count = randomInt(1, 3);
    const chosen = shuffled.slice(0, count);

    for (const serviceTypeId of chosen) {
      await client.query(
        `INSERT INTO worker_services (worker_id, service_type_id)
         VALUES ($1, $2)`,
        [workerId, serviceTypeId]
      );
    }

    console.log(`Seeded worker ${i + 1}/20: ${name} (${chosen.length} services)`);
  }
}

async function main() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const serviceTypeIds = await seedServiceTypes(client);
    await seedWorker(client, serviceTypeIds);

    await client.query("COMMIT");
    console.log("✅ Seed complete: 20 workers created.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed, rolled back:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
