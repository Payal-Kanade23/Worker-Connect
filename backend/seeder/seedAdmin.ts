import bcrypt from "bcrypt";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({
     path: "../.env",
});

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedAdmin() {
  const client = await pool.connect();

  try {
    const passwordHash = await bcrypt.hash("admin123", 10);

    const query = `
      INSERT INTO users
        (name, email, phone, password_hash, role, is_active)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, role;
    `;

    const values = [
      "Srusti",
      "Sr23@gmail.com",
      "7894589632",
      passwordHash,
      "admin",
      true,
    ];

    const result = await client.query(query, values);

    console.log("Admin seeded successfully:");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("Error seeding admin:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedAdmin();