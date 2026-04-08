import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'glamour_secret_2026';

export const verifyAdmin = (req) => {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return null;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    if (user.role !== 'admin') return null;
    return user;
  } catch (e) {
    return null;
  }
};
