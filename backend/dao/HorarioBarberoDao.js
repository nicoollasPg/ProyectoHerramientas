// backend/dao/HorarioBarberoDao.js
const pool = require('../config/database');
const HorarioBarbero = require('../models/HorarioBarbero');

class HorarioBarberoDao {
    /**
     * Crear un nuevo horario para un barbero
     */
    async crearHorario(data) {
        const horario = new HorarioBarbero(data);
        const validacion = horario.validar();

        if (!validacion.valido) {
            throw new Error(validacion.errores.join(', '));
        }

        const query = `
      INSERT INTO horarios_barberos (id_barbero, dia_semana, hora_inicio, hora_fin)
      VALUES (?, ?, ?, ?)
    `;

        const [result] = await pool.execute(query, [
            horario.id_barbero,
            horario.dia_semana,
            horario.hora_inicio,
            horario.hora_fin
        ]);

        return result.insertId;
    }

    /**
     * Obtener todos los horarios de un barbero
     */
    async obtenerHorariosPorBarbero(id_barbero) {
        const query = `
      SELECT h.*, u.nombre_usuario as barbero_nombre
      FROM horarios_barberos h
      INNER JOIN usuarios u ON h.id_barbero = u.id
      WHERE h.id_barbero = ?
      ORDER BY h.dia_semana, h.hora_inicio
    `;

        const [rows] = await pool.execute(query, [id_barbero]);
        return rows;
    }

    /**
     * Obtener horario de un barbero para un día específico
     */
    async obtenerHorarioPorDia(id_barbero, dia_semana) {
        const query = `
      SELECT * FROM horarios_barberos
      WHERE id_barbero = ? AND dia_semana = ?
    `;

        const [rows] = await pool.execute(query, [id_barbero, dia_semana]);
        return rows[0] || null;
    }

    /**
     * Actualizar un horario existente
     */
    async actualizarHorario(id, data) {
        const horario = new HorarioBarbero(data);
        const validacion = horario.validar();

        if (!validacion.valido) {
            throw new Error(validacion.errores.join(', '));
        }

        const query = `
      UPDATE horarios_barberos
      SET dia_semana = ?, hora_inicio = ?, hora_fin = ?
      WHERE id = ? AND id_barbero = ?
    `;

        const [result] = await pool.execute(query, [
            horario.dia_semana,
            horario.hora_inicio,
            horario.hora_fin,
            id,
            horario.id_barbero
        ]);

        return result.affectedRows > 0;
    }

    /**
     * Eliminar un horario
     */
    async eliminarHorario(id) {
        const query = `DELETE FROM horarios_barberos WHERE id = ?`;
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }

    /**
     * Verificar si un barbero está trabajando en una fecha y hora específica
     */
    async verificarDisponibilidadBarbero(id_barbero, fecha_hora) {
        // Extraer día de la semana (1=Domingo, 7=Sábado) y hora
        const fecha = new Date(fecha_hora);
        const dia_semana = fecha.getDay() + 1; // JavaScript usa 0=Domingo, ajustamos a 1=Domingo
        const hora = fecha.toTimeString().substring(0, 8); // HH:MM:SS

        const query = `
      SELECT * FROM horarios_barberos
      WHERE id_barbero = ? 
        AND dia_semana = ?
        AND ? BETWEEN hora_inicio AND hora_fin
    `;

        const [rows] = await pool.execute(query, [id_barbero, dia_semana, hora]);

        return {
            disponible: rows.length > 0,
            horario: rows[0] || null,
            dia_semana: dia_semana,
            hora_consultada: hora
        };
    }

    /**
     * Obtener todos los horarios (para vista general)
     */
    async obtenerTodos() {
        const query = `
      SELECT h.*, u.nombre_usuario as barbero_nombre
      FROM horarios_barberos h
      INNER JOIN usuarios u ON h.id_barbero = u.id
      ORDER BY u.nombre_usuario, h.dia_semana, h.hora_inicio
    `;

        const [rows] = await pool.execute(query);
        return rows;
    }
}

module.exports = new HorarioBarberoDao();
