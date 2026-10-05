import crypto from 'crypto'
import { pool } from '../config/db.js'

function hashToken(token:string):string{
    return crypto.createHash('sha256').update(token).digest('hex')
}

export async function storeRefreshToken(userId:string ,token:string, expiresAt:Date ):Promise<void>{
    const tokenHash = hashToken(token)

    await pool.query(
         `INSERT INTO refresh_token (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
    )
} 

export async function isRefreshTokenValid(userId: string, token: string): Promise<boolean> {
  const tokenHash = hashToken(token);
  const result = await pool.query(
    `SELECT id FROM refresh_token
     WHERE user_id = $1 AND token_hash = $2 AND expires_at > now()`,
    [userId, tokenHash]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function revokeRefreshToken(userId: string, token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await pool.query(`DELETE FROM refresh_token WHERE user_id = $1 AND token_hash = $2`, [userId, tokenHash]);
}

export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  await pool.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId]);
}