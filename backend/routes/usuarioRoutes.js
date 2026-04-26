const express = require('express');
const UsuarioController = require('../controllers/UsuarioController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// RUTAS PUBLICAS
router.post('/registro', UsuarioController.registrar);
router.post('/login', loginLimiter, UsuarioController.login); // Rate limiting en login

// RUTA PUBLICA - LISTAR BARBEROS (para formulario de reservas)
router.get('/barberos', UsuarioController.listarBarberos);

module.exports = router;




