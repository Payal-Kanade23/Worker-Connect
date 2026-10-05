// seeds/customer.seed.ts
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
const { Pool } = pg;
type PoolClient = pg.PoolClient; 
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const customers = [
  { name: 'ABC Joshi', email: 'kavita.joshi@example.com', address: 'A-12, Adajan, Surat', lat: 21.1850, lng: 72.7920 , password:"12345678" },
  { name: 'PQR Verma', email: 'rohan.verma@example.com', address: 'B-45, Vesu, Surat', lat: 21.1500, lng: 72.7700 ,password:"12345678"},
  { name: 'XYZ Kapoor', email: 'neha.kapoor@example.com', address: 'C-7, Athwalines, Surat', lat: 21.1930, lng: 72.8280 ,password:"12345678"},
  { name: 'MNC Nair', email: 'arjun.nair@example.com', address: 'D-23, City Light, Surat', lat: 21.1780, lng: 72.8180 ,password:"12345678"},
  { name: 'REW Iyer', email: 'divya.iyer@example.com', address: 'E-9, Piplod, Surat', lat: 21.1610, lng: 72.7830 ,password:"12345678"},
];

async function seedCustomers() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const c of customers) {
      
      const passwordHash = await bcrypt.hash(c.password, 10);
      
      const userRes = await client.query(
        `INSERT INTO "users" (id, name, email, role, is_active , password_hash)
         VALUES (gen_random_uuid(), $1, $2, 'customer', true,$3)
         RETURNING id`,
        [c.name, c.email,passwordHash]
      );
      const userId = userRes.rows[0].id;

      await client.query(
        `INSERT INTO customer_profiles (id, user_id, default_address, latitude, longitude)
         VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
        [userId, c.address, c.lat, c.lng]
      );
    }
    await client.query('COMMIT');
    console.log('Seeded 5 customers successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err);
  } finally {
    client.release();
    process.exit();
  }
}

seedCustomers();