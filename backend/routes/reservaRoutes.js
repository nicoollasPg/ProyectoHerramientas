const express = require('express');
const router = express.Router();
const ReservaController = require('../controllers/ReservaController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Crear reserva (usuario o invitado)
router.post('/reservas', ReservaController.registrar);

// Listar todas las reservas (solo admin)
router.get('/reservas', authMiddleware, requireRole(['admin']), ReservaController.obtenerTodas);

// Actualizar estado de una reserva (solo admin)
router.patch('/reservas/:id/estado', authMiddleware, requireRole(['admin']), ReservaController.actualizarEstado);

// Actualizar automáticamente todas las reservas pasadas (solo admin)
router.post('/reservas/actualizar-pasadas', authMiddleware, requireRole(['admin']), ReservaController.actualizarReservasPasadas);


module.exports = router;
