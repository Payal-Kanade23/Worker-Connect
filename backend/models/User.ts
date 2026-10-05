import { pool } from "../config/db.js";
import type { service_type, User , UserRole, worker_service} from '../type/types.js'
import type{ Worker } from "../type/types.js";

export async function findUserByEmail(email:string):Promise<User | null>{
  console.log("==",email)
    const result = await pool.query('SELECT * FROM users WHERE email = $1',[email]);
    return result.rows[0] ?? null;

}

export async function findUserById(id:string):Promise<User | null> {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

interface CreateLocalUserInput {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
}

export async function createLocalUser(input:CreateLocalUserInput):Promise<User>{
     const { name, email, phone, passwordHash, role } = input;
  const result = await pool.query<User>(
    `INSERT INTO users (name, email, phone, password_hash, auth_provider, role)
     VALUES ($1, $2, $3, $4, 'local', $5)
     RETURNING id, name, email, role`,
    [name, email, phone, passwordHash, role]
  );
  return result.rows[0]!;
}

export async function createGoogleUser(input: {
  name: string;
  email: string;
  role: UserRole | null;
}): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (name, email, password_hash, auth_provider, role)
     VALUES ($1, $2, NULL, 'google', $3)
     RETURNING id, name, email, role`,
    [input.name, input.email, input.role]
  );
  return result.rows[0]!;
}

export async function setUserRole(userId: string, role: UserRole): Promise<User> {
  const result = await pool.query<User>(
    `UPDATE users SET role = $1 WHERE id = $2 RETURNING *`,
    [role, userId]
  );
  return result.rows[0]!;
}


export async function createProfileForRole(userId: string, role: UserRole): Promise<void> {
  if (role === 'worker') {
    await pool.query(
      `INSERT INTO worker_profiles (user_id, employment_type) VALUES ($1, 'full_time')`,
      [userId]
    );
  } else if (role === 'customer') {
    await pool.query(`INSERT INTO customer_profiles (user_id) VALUES ($1)`, [userId]);
  }
}

//update profile base on frontend form
interface InputData {
  name: string;
  phone: string;

  // Customer
  default_address?: string;
  latitude?: number;
  longitude?: number;

  // Worker
  employment_type?: string;
  hour_per_day?: number;
  hourly_rate?: number;
  service_radius_km?: number;
  available_from?: string;
  available_to?: string;
}

export async function updateProfile(
  userId: string,
  role: UserRole,
  data: InputData
): Promise<User> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Update common user information
    const userResult = await client.query(
      `
      UPDATE users
      SET
          name = $1,
          phone = $2
      WHERE id = $3
      RETURNING
          id,
          name,
          email,
          phone,
          profile_image,
          role;
      `,
      [
        data.name,
        data.phone,
        userId
      ]
    );

    if (userResult.rows.length === 0) {
      throw new Error("User not found");
    }

    let profileResult;

    if (role === "worker") {
      profileResult = await client.query(
        `
        UPDATE worker_profiles
        SET
            employment_type = $1,
            hour_per_day = $2,
            hourly_rate = $3,
            service_radius_km = $4,
            available_from = $5,
            available_to = $6,
            latitude = $8,
            longitude = $9
        WHERE user_id = $7
        RETURNING
            id,
            user_id,
            employment_type,
            hour_per_day,
            hourly_rate,
            service_radius_km,
            available_from,
            available_to,
            is_verified,
            rating_avg,
            latitude,
            longitude;
        `,
        [
          data.employment_type,
          data.hour_per_day,
          data.hourly_rate,
          data.service_radius_km,
          data.available_from,
          data.available_to,
          userId,
           data.latitude,
          data.longitude,
        ]
      );
    }

    if (role === "customer") {
      profileResult = await client.query(
        `
        UPDATE customer_profiles
        SET
            default_address = $1,
            latitude = $2,
            longitude = $3
        WHERE user_id = $4
        RETURNING
            id,
            user_id,
            default_address,
            latitude,
            longitude;
        `,
        [
          data.default_address,
          data.latitude,
          data.longitude,
          userId
        ]
      );
    }

    await client.query("COMMIT");

    return {
      ...userResult.rows[0],
      ...profileResult?.rows[0]
    };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getAllWorkers(){
  const result = await pool.query(
    ` SELECT 
    users.id AS user_id,
    users.role AS role,
    users.is_active AS is_active,
    users.created_at AS created_at,
    users.password_hash AS password_hash,
    users.profile_image AS profile_image,
    users.auth_provider AS auth_provider,
    users.name AS name,
    users.email AS email,
    users.phone AS phone,

     worker_profiles.id AS worker_id,
    worker_profiles.employment_type AS employment_type,
    worker_profiles.hour_per_day AS hour_per_day,
    worker_profiles.hourly_rate AS hourly_rate,
    worker_profiles.latitude AS latitude,
    worker_profiles.longitude AS longitude,
    worker_profiles.service_radius_km AS service_radius_km,
    worker_profiles.available_from AS available_from,
    worker_profiles.available_to AS available_to,
    worker_profiles.is_verified AS is_verified,
    worker_profiles.rating_avg AS rating_avg,
    
    json_agg(
        json_build_object(
            'id', service_types.id,
            'name', service_types.name
        )
    ) FILTER (WHERE service_types.id IS NOT NULL) AS services
FROM users 
LEFT JOIN worker_profiles 
    ON worker_profiles.user_id = users.id 
LEFT JOIN worker_services 
    ON worker_services.worker_id = worker_profiles.id
LEFT JOIN service_types 
    ON service_types.id = worker_services.service_type_id
WHERE users.role = 'worker'
GROUP BY users.id, worker_profiles.id;`)

  return result.rows;
}
export async function getWorkerById(id:string){
  const query =
    `
    SELECT 
    users.id AS user_id,
    users.role AS role,
    users.is_active AS is_active,
    users.created_at AS created_at,
    users.password_hash AS password_hash,
    users.profile_image AS profile_image,
    users.auth_provider AS auth_provider,
    users.name AS name,
    users.email AS email,
    users.phone AS phone,

     worker_profiles.id AS worker_id,
    worker_profiles.employment_type AS employment_type,
    worker_profiles.hour_per_day AS hour_per_day,
    worker_profiles.hourly_rate AS hourly_rate,
    worker_profiles.latitude AS latitude,
    worker_profiles.longitude AS longitude,
    worker_profiles.service_radius_km AS service_radius_km,
    worker_profiles.available_from AS available_from,
    worker_profiles.available_to AS available_to,
    worker_profiles.is_verified AS is_verified,
    worker_profiles.rating_avg AS rating_avg,
    json_agg(
        json_build_object(
            'id', service_types.id,
            'name', service_types.name
        )
    ) FILTER (WHERE service_types.id IS NOT NULL) AS services
FROM users 
LEFT JOIN worker_profiles 
    ON worker_profiles.user_id = users.id 
LEFT JOIN worker_services 
    ON worker_services.worker_id = worker_profiles.id
LEFT JOIN service_types 
    ON service_types.id = worker_services.service_type_id
WHERE users.role = 'worker' AND users.id = $1
GROUP BY users.id, worker_profiles.id;`

const result = await pool.query(query,[id])
  return result.rows[0];
}

export const getServiceByWorkerId=async(id:string) =>{
  
   const result = await pool.query(`
    SELECT id , name
     from worker_services ws
     JOIN service_types s 
     ON s.id = ws.service_type_id
      WHERE worker_id = $1`,[id]);

    return result.rows;
}
interface ServiceResponse{
  service_id:string,
  name:string
}
export const getServiceByBookedId= async(id:string) : Promise<ServiceResponse[]>=>{
  
   const result = await pool.query<ServiceResponse>(`
   SELECT bs.service_id , s.name
     from booking_services bs
     JOIN service_types s 
     ON s.id = bs.service_id
      WHERE bs.booking_id = $1`,[id]);

    return result.rows;
}
export const getWorkerId=async(user_id:string) =>{
  
   const result = await pool.query(`
    SELECT * 
     from worker_profiles
      WHERE user_id = $1`,[user_id]);
   console.log("result:",result.rows[0])
    return result.rows[0];
}

export const getCustomerId=async(user_id:string) =>{
  
   const result = await pool.query(`
    SELECT * 
     from customer_profiles
      WHERE user_id = $1`,[user_id]);
 
      console.log("customer id fetch:",result.rows[0])
    return result.rows[0];
}


export const findUserByCustomerId = async(c_id:string)=>{
   const result = await pool.query(`
    SELECT u.* 
     from users u
     JOIN customer_profiles c ON c.user_id = u.id   
      WHERE c.id = $1`,[c_id]);
 
      console.log("customer id fetch:",result.rows[0])
    return result.rows[0];
}

export const findUserByWorkerId = async(w_id:string)=>{
   const result = await pool.query(`
    SELECT u.* 
     from users u
     JOIN worker_profiles w ON w.user_id = u.id   
      WHERE w.id = $1`,[w_id]);
 
      console.log("customer id fetch:",result.rows[0])
    return result.rows[0];
}
 