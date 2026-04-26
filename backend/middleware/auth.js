const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '')
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_fadehouse');

    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ message: 'Sesion expirada' });
    }

    req.user = decoded;
    next();
  } catch (error) {

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Sesion expirada' });
    }
    return res.status(401).json({ message: 'Token invalido' });
  }
};

const requireRole = (roles = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({ message: 'No tienes permisos suficientes' });
  }

  next();
};

module.exports = { authMiddleware, requireRole };
