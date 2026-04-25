const ReservaDAO = require('../dao/ReservaDao');

const ReservaController = {
  registrar: async (req, res) => {
    try {
      const { id_barbero, id_servicio, fecha_hora } = req.body;

      // Validar campos requeridos
      if (!id_barbero || !id_servicio || !fecha_hora) {
        return res.status(400).json({
          message: 'Faltan datos requeridos: id_barbero, id_servicio, fecha_hora'
        });
      }

      // ✅ VALIDAR DISPONIBILIDAD antes de crear la reserva
      const validacion = await ReservaDAO.validarDisponibilidad(
        id_barbero,
        fecha_hora,
        id_servicio
      );

      if (!validacion.disponible) {
        return res.status(400).json({
          disponible: false,
          message: validacion.motivo,
          codigo: validacion.codigo,
          detalles: validacion
        });
      }

      // Si la validación pasa, crear la reserva
      const id = await ReservaDAO.crearReserva(req.body);

      res.status(201).json({
        message: 'Reserva creada exitosamente',
        id,
        disponible: true,
        detalles: validacion.detalles
      });
    } catch (err) {
      console.error('Error en registrar reserva:', err);
      res.status(500).json({ message: 'Error al crear reserva', error: err.message });
    }
  },


  obtenerTodas: async (req, res) => {
    try {
      const reservas = await ReservaDAO.obtenerTodas();
      res.json(reservas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al obtener reservas' });
    }
  },

  actualizarEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      // Validar que el estado sea válido
      const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
      if (!estado || !estadosValidos.includes(estado)) {
        return res.status(400).json({
          message: 'Estado inválido. Debe ser: pendiente, confirmada, cancelada o completada'
        });
      }

      const actualizado = await ReservaDAO.actualizarEstado(id, estado);

      if (actualizado) {
        res.json({ message: 'Estado actualizado correctamente' });
      } else {
        res.status(404).json({ message: 'Reserva no encontrada' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al actualizar estado de la reserva' });
    }
  },

  actualizarReservasPasadas: async (req, res) => {
    try {
      const resultado = await ReservaDAO.actualizarReservasPasadas();

      res.json({
        message: 'Actualización completada',
        reservas_actualizadas: resultado.actualizadas,
        detalles: resultado.detalles
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al actualizar reservas pasadas' });
    }
  }

};

module.exports = ReservaController;
