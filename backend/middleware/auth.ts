import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload, UserRole } from '../type/types.js';

export function authenticate(req: Request, res: Response, next: NextFunction): void {

  const token = req.cookies.access_token;
  console.log(token)
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;
    req.jwtUser = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

