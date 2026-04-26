// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const xss = require('xss-clean');
const pool = require('./config/database');
require('dotenv').config();

// Importar middlewares de seguridad
const { apiLimiter } = require('./middleware/rateLimiter');
const { sanitizeInputs } = require('./middleware/validator');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Importar rutas
const usuarioRoutes = require('./routes/usuarioRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const adminRoutes = require('./routes/adminRoutes');
const horarioRoutes = require('./routes/horarioRoutes');


const app = express();

// ==========================================
// CONFIGURACION DE SEGURIDAD
// ==========================================

// Helmet - Headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com", "fonts.googleapis.com"],
      scriptSrc: ["'self'", "cdn.jsdelivr.net"],
      fontSrc: ["'self'", "cdnjs.cloudflare.com", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
      frameSrc: ["'self'", "https://www.google.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'sameorigin'
  },
  noSniff: true,
  xssFilter: true
}));

// Deshabilitar header X-Powered-By
app.disable('x-powered-by');

// CORS configuracion segura
const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      process.env.FRONTEND_URL,
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:5500', // Live Server
      'http://127.0.0.1:5500', // Live Server
      'http://localhost:5501',
      'http://127.0.0.1:5501',
      'http://localhost:5502',
      'http://127.0.0.1:5502'
    ].filter(Boolean);

    // Permitir requests sin origin (como Postman o apps moviles)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS Bloqueado Origen:', origin); // Log para depuracion
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Limites de tamaño de request - proteccion DoS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitizacion XSS
app.use(xss());

// Sanitizacion de inputs
app.use(sanitizeInputs);

// Rate limiting global para API
app.use('/api', apiLimiter);

// ==========================================
// SERVIR FRONTEND
// ==========================================
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// ==========================================
// RUTAS API
// ==========================================

// Ruta de salud del servidor
app.get('/api/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1 as ok');
    res.json({ status: 'OK', database: 'CONECTADO' });
  } catch (error) {
    console.error('Error DB:', error);
    res.status(500).json({ error: 'Error de conexion a base de datos' });
  }
});

// Rutas de la aplicacion
app.use('/api', usuarioRoutes);
app.use('/api', reservaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', horarioRoutes);


// ==========================================
// MANEJO DE ERRORES
// ==========================================

// Servir frontend para rutas no encontradas (SPA)
app.get('*', (req, res, next) => {
  // Si es una ruta de API que no existe, pasar al 404 handler
  if (req.path.startsWith('/api/')) {
    return next();
  }
  // Servir el frontend
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 404 para rutas API no encontradas
app.use('/api/*', notFoundHandler);

// Middleware centralizado de errores (debe ir al final)
app.use(errorHandler);

// ==========================================
// INICIAR SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(` Backend corriendo en http://localhost:${PORT}`);
  console.log(` Seguridad: Helmet, Rate Limiting, XSS Protection activados`);
});
