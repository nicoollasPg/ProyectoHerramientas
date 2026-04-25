// backend/controllers/HorarioBarberoController.js
const HorarioBarberoDao = require('../dao/HorarioBarberoDao');

class HorarioBarberoController {
    /**
     * Crear un nuevo horario
     * POST /api/admin/horarios
     */
    static async crear(req, res) {
        try {
            const { id_barbero, dia_semana, hora_inicio, hora_fin } = req.body;

            if (!id_barbero || !dia_semana || !hora_inicio || !hora_fin) {
                return res.status(400).json({
                    message: 'Faltan datos requeridos: id_barbero, dia_semana, hora_inicio, hora_fin'
                });
            }

            const id = await HorarioBarberoDao.crearHorario(req.body);
            res.status(201).json({
                message: 'Horario creado exitosamente',
                id
            });
        } catch (error) {
            console.error('Error en crear horario:', error);
            res.status(500).json({
                message: 'Error al crear horario',
                error: error.message
            });
        }
    }

    /**
     * Listar horarios de un barbero
     * GET /api/admin/horarios/barbero/:id
     */
    static async listarPorBarbero(req, res) {
        try {
            const { id } = req.params;
            const horarios = await HorarioBarberoDao.obtenerHorariosPorBarbero(id);
            res.json(horarios);
        } catch (error) {
            console.error('Error en listar horarios:', error);
            res.status(500).json({
                message: 'Error al listar horarios',
                error: error.message
            });
        }
    }

    /**
     * Listar todos los horarios
     * GET /api/admin/horarios
     */
    static async listarTodos(req, res) {
        try {
            const horarios = await HorarioBarberoDao.obtenerTodos();
            res.json(horarios);
        } catch (error) {
            console.error('Error en listar todos los horarios:', error);
            res.status(500).json({
                message: 'Error al listar horarios',
                error: error.message
            });
        }
    }

    /**
     * Actualizar un horario
     * PUT /api/admin/horarios/:id
     */
    static async actualizar(req, res) {
        try {
            const { id } = req.params;
            const actualizado = await HorarioBarberoDao.actualizarHorario(id, req.body);

            if (actualizado) {
                res.json({ message: 'Horario actualizado exitosamente' });
            } else {
                res.status(404).json({ message: 'Horario no encontrado' });
            }
        } catch (error) {
            console.error('Error en actualizar horario:', error);
            res.status(500).json({
                message: 'Error al actualizar horario',
                error: error.message
            });
        }
    }

    /**
     * Eliminar un horario
     * DELETE /api/admin/horarios/:id
     */
    static async eliminar(req, res) {
        try {
            const { id } = req.params;
            const eliminado = await HorarioBarberoDao.eliminarHorario(id);

            if (eliminado) {
                res.json({ message: 'Horario eliminado exitosamente' });
            } else {
                res.status(404).json({ message: 'Horario no encontrado' });
            }
        } catch (error) {
            console.error('Error en eliminar horario:', error);
            res.status(500).json({
                message: 'Error al eliminar horario',
                error: error.message
            });
        }
    }

    /**
     * Verificar disponibilidad de un barbero (endpoint público)
     * GET /api/horarios/disponibilidad/:id_barbero?fecha_hora=2024-12-01T10:00:00
     */
    static async verificarDisponibilidad(req, res) {
        try {
            const { id_barbero } = req.params;
            const { fecha_hora } = req.query;

            if (!fecha_hora) {
                return res.status(400).json({
                    message: 'Se requiere el parámetro fecha_hora'
                });
            }

            const resultado = await HorarioBarberoDao.verificarDisponibilidadBarbero(
                id_barbero,
                fecha_hora
            );

            res.json(resultado);
        } catch (error) {
            console.error('Error en verificar disponibilidad:', error);
            res.status(500).json({
                message: 'Error al verificar disponibilidad',
                error: error.message
            });
        }
    }
}

module.exports = HorarioBarberoController;
