const pool = require('../config/database');

class ReservaDAO {
  // Crear una nueva reserva
  async crearReserva(reservaData) {
    const {
      id_usuario,
      id_barbero,
      id_servicio,
      fecha_hora,
      estado,
      notas,
      codigo_promocion,
      precio_final
    } = reservaData;

    const query = `
      INSERT INTO reservas
        (id_usuario, id_barbero, id_servicio, fecha_hora, estado, notas, codigo_promocion, precio_final)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      id_usuario || null,
      id_barbero,
      id_servicio,
      fecha_hora,
      estado || 'pendiente',
      notas || null,
      codigo_promocion || null,
      precio_final || null
    ]);

    return result.insertId;
  }

  // Obtener todas las reservas (para el panel admin)
  async obtenerTodas() {
    const query = `
      SELECT 
        r.id,
        COALESCE(u.nombre_usuario, 'Invitado') AS usuario_nombre,
        b.nombre_usuario AS barbero_nombre,
        s.nombre AS servicio_nombre,
        r.fecha_hora,
        r.estado,
        r.notas,
        r.precio_final
      FROM reservas r
      LEFT JOIN usuarios u ON r.id_usuario = u.id
      INNER JOIN usuarios b ON r.id_barbero = b.id
      INNER JOIN servicios s ON r.id_servicio = s.id
      ORDER BY r.id DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Obtener reservas de un usuario específico
  async obtenerReservasPorUsuario(id_usuario) {
    const query = `
      SELECT 
        r.id,
        s.nombre AS servicio_nombre,
        r.fecha_hora,
        r.estado,
        r.notas,
        r.precio_final
      FROM reservas r
      INNER JOIN servicios s ON r.id_servicio = s.id
      WHERE r.id_usuario = ?
      ORDER BY r.fecha_hora DESC
    `;
    const [rows] = await pool.execute(query, [id_usuario]);
    return rows;
  }

  // Actualizar estado de una reserva
  async actualizarEstado(id, nuevoEstado) {
    const query = `
      UPDATE reservas
      SET estado = ?
      WHERE id = ?
    `;
    const [result] = await pool.execute(query, [nuevoEstado, id]);
    return result.affectedRows > 0;
  }

  /**
   * Validar disponibilidad COMPLETA para una reserva
   * Verifica: 1) Barbero trabaja en esa fecha/hora, 2) No hay solapamiento con otras reservas
   */
  async validarDisponibilidad(id_barbero, fecha_hora, id_servicio) {
    try {
      // 1. Obtener duración del servicio
      const [servicios] = await pool.execute(
        'SELECT duracion_minutos FROM servicios WHERE id = ?',
        [id_servicio]
      );

      if (servicios.length === 0) {
        return {
          disponible: false,
          motivo: 'Servicio no encontrado',
          codigo: 'SERVICIO_INVALIDO'
        };
      }

      const duracion_minutos = servicios[0].duracion_minutos;

      // 2. Verificar que el barbero trabaja en ese día y horario
      const fecha = new Date(fecha_hora);
      const dia_semana = fecha.getDay() + 1; // 0=Domingo -> 1=Domingo
      const hora = fecha.toTimeString().substring(0, 8); // HH:MM:SS

      const [horarios] = await pool.execute(
        `SELECT * FROM horarios_barberos 
         WHERE id_barbero = ? 
           AND dia_semana = ?
           AND ? BETWEEN hora_inicio AND hora_fin`,
        [id_barbero, dia_semana, hora]
      );

      if (horarios.length === 0) {
        return {
          disponible: false,
          motivo: 'El barbero no trabaja en este día u horario',
          codigo: 'FUERA_DE_HORARIO',
          dia_semana,
          hora_consultada: hora
        };
      }

      // 3. Calcular hora de fin de la reserva
      const fecha_fin = new Date(fecha.getTime() + duracion_minutos * 60000);

      // 4. Verificar solapamiento con otras reservas del barbero
      // Una reserva solapa si:
      // - La nueva empieza antes de que termine una existente
      // - Y la nueva termina después de que empiece una existente
      const [reservasExistentes] = await pool.execute(
        `SELECT r.id, r.fecha_hora, s.duracion_minutos,
                DATE_ADD(r.fecha_hora, INTERVAL s.duracion_minutos MINUTE) as fecha_fin
         FROM reservas r
         INNER JOIN servicios s ON r.id_servicio = s.id
         WHERE r.id_barbero = ?
           AND r.estado IN ('pendiente', 'confirmada')
           AND (
             (r.fecha_hora < ? AND DATE_ADD(r.fecha_hora, INTERVAL s.duracion_minutos MINUTE) > ?)
             OR
             (r.fecha_hora < ? AND r.fecha_hora >= ?)
           )`,
        [id_barbero, fecha_fin.toISOString(), fecha_hora, fecha_fin.toISOString(), fecha_hora]
      );

      if (reservasExistentes.length > 0) {
        return {
          disponible: false,
          motivo: 'Ya existe una reserva en este horario',
          codigo: 'HORARIO_OCUPADO',
          reserva_existente: {
            id: reservasExistentes[0].id,
            fecha_hora: reservasExistentes[0].fecha_hora,
            fecha_fin: reservasExistentes[0].fecha_fin
          }
        };
      }

      // 5. Verificar que la reserva termine dentro del horario laboral
      const hora_fin = fecha_fin.toTimeString().substring(0, 8);
      if (hora_fin > horarios[0].hora_fin) {
        return {
          disponible: false,
          motivo: `La reserva terminaría fuera del horario laboral (${horarios[0].hora_fin})`,
          codigo: 'EXCEDE_HORARIO',
          hora_fin_estimada: hora_fin,
          hora_fin_laboral: horarios[0].hora_fin
        };
      }

      // ✅ Todo OK
      return {
        disponible: true,
        motivo: 'Horario disponible',
        codigo: 'DISPONIBLE',
        detalles: {
          fecha_inicio: fecha_hora,
          fecha_fin: fecha_fin.toISOString(),
          duracion_minutos,
          horario_barbero: horarios[0]
        }
      };

    } catch (error) {
      console.error('Error en validarDisponibilidad:', error);
      throw error;
    }
  }

  // Actualizar automáticamente reservas pasadas
  async actualizarReservasPasadas() {
    try {
      // Obtener reservas que serán actualizadas (para log)
      const querySelect = `
        SELECT 
          id, 
          fecha_hora, 
          estado,
          TIMESTAMPDIFF(HOUR, fecha_hora, NOW()) as horas_pasadas
        FROM reservas 
        WHERE estado = 'pendiente' 
          AND fecha_hora < NOW()
      `;
      const [reservasPasadas] = await pool.execute(querySelect);

      // Actualizar reservas pasadas de "pendiente" a "completada"
      const queryUpdate = `
        UPDATE reservas 
        SET estado = 'completada' 
        WHERE estado = 'pendiente' 
          AND fecha_hora < NOW()
      `;
      const [result] = await pool.execute(queryUpdate);

      return {
        actualizadas: result.affectedRows,
        detalles: reservasPasadas
      };
    } catch (error) {
      console.error('Error al actualizar reservas pasadas:', error);
      throw error;
    }
  }
}

module.exports = new ReservaDAO();
