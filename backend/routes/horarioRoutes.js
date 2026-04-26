// backend/routes/horarioRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const HorarioBarberoController = require('../controllers/HorarioBarberoController');

// Rutas protegidas (solo admin)
router.post('/admin/horarios',
    authMiddleware,
    requireRole(['admin']),
    HorarioBarberoController.crear
);

router.get('/admin/horarios',
    authMiddleware,
    requireRole(['admin']),
    HorarioBarberoController.listarTodos
);

router.get('/admin/horarios/barbero/:id',
    authMiddleware,
    requireRole(['admin']),
    HorarioBarberoController.listarPorBarbero
);

router.put('/admin/horarios/:id',
    authMiddleware,
    requireRole(['admin']),
    HorarioBarberoController.actualizar
);

router.delete('/admin/horarios/:id',
    authMiddleware,
    requireRole(['admin']),
    HorarioBarberoController.eliminar
);

// Ruta pública para verificar disponibilidad
router.get('/horarios/disponibilidad/:id_barbero',
    HorarioBarberoController.verificarDisponibilidad
);

module.exports = router;
