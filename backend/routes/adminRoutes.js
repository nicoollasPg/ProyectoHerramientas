// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const UsuarioController = require('../controllers/UsuarioController');
const ServicioController = require('../controllers/ServicioController');
const ReservaController = require('../controllers/ReservaController');

// Usuarios
router.get('/usuarios', authMiddleware, requireRole(['admin']), UsuarioController.obtenerTodos);

// Servicios
router.get('/servicios', authMiddleware, requireRole(['admin']), ServicioController.listar);
router.post('/servicios', authMiddleware, requireRole(['admin']), ServicioController.crear);
router.put('/servicios/:id', authMiddleware, requireRole(['admin']), ServicioController.actualizar);
router.delete('/servicios/:id', authMiddleware, requireRole(['admin']), ServicioController.eliminar);

//  Reservas
router.get('/reservas', authMiddleware, requireRole(['admin']), ReservaController.obtenerTodas);

// Reportes
const ReporteController = require('../controllers/ReporteController');
router.get('/reportes/excel', authMiddleware, requireRole(['admin']), ReporteController.generarExcel);

module.exports = router;
