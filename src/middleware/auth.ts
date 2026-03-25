import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ status: 401, code: 'UNAUTHORIZED', message: 'Missing or invalid token' })
    return
  }

  const token = header.slice(7)

  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
      res.status(401).json({ status: 401, code: 'UNAUTHORIZED', message: 'Invalid token' })
      return
    }
    req.user = data.user
    next()
  } catch {
    res.status(401).json({ status: 401, code: 'UNAUTHORIZED', message: 'Token verification failed' })
  }
}
