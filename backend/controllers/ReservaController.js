const ReservaDAO = require('../dao/ReservaDao');
const { enviarCorreoReserva } = require('../services/emailService');

const ReservaController = {
  registrar: async (req, res) => {
    try {
      const { id_barbero, id_servicio, fecha_hora } = req.body;

      if (!id_barbero || !id_servicio || !fecha_hora) {
        return res.status(400).json({
          message: 'Faltan datos requeridos: id_barbero, id_servicio, fecha_hora'
        });
      }

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

      const id = await ReservaDAO.crearReserva(req.body);

      console.log('✅ Reserva creada:', id);

      try {
        const datosCorreo =
          await ReservaDAO.obtenerDatosCorreoReserva(id);

        console.log('📧 DATOS CORREO:', datosCorreo);

        if (datosCorreo) {
          console.log('📨 Intentando enviar correo...');

          const resultado = await enviarCorreoReserva(datosCorreo);

          console.log('✅ Resultado Resend:', resultado);
        } else {
          console.log('⚠️ No se encontraron datos para enviar correo');
        }

      } catch (errorCorreo) {
        console.error('❌ Error enviando correo:', errorCorreo);
      }

      res.status(201).json({
        message: 'Reserva creada exitosamente',
        id,
        disponible: true,
        detalles: validacion.detalles
      });

    } catch (err) {
      console.error('❌ Error en registrar reserva:', err);

      res.status(500).json({
        message: 'Error al crear reserva',
        error: err.message
      });
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

      const estadosValidos = [
        'pendiente',
        'confirmada',
        'cancelada',
        'completada'
      ];

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
      res.status(500).json({
        message: 'Error al actualizar estado de la reserva'
      });
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
      res.status(500).json({
        message: 'Error al actualizar reservas pasadas'
      });
    }
  }
};

module.exports = ReservaController;