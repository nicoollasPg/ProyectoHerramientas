const express = require('express');
const router = express.Router();
const ServicioController = require('../controllers/ServicioController');

router.post('/', ServicioController.crear);
router.get('/', ServicioController.listar);
router.put('/:id', ServicioController.actualizar);
router.delete('/:id', ServicioController.eliminar);

module.exports = router;