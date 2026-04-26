const pool = require('../config/database');

class ServicioDao {
  async crearServicio({ nombre, descripcion, precio }) {
    const query = 'INSERT INTO servicios (nombre, descripcion, precio) VALUES (?, ?, ?)';
    const [result] = await pool.execute(query, [nombre, descripcion, precio]);
    return result.insertId;
  }

  async listarServicios() {
    const query = 'SELECT * FROM servicios';
    const [rows] = await pool.execute(query);
    return rows;
  }

  async encontrarPorId(id) {
    const query = 'SELECT * FROM servicios WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  }

  async actualizarServicio(id, { nombre, descripcion, precio }) {
    const query = 'UPDATE servicios SET nombre = ?, descripcion = ?, precio = ? WHERE id = ?';
    const [result] = await pool.execute(query, [nombre, descripcion, precio, id]);
    return result.affectedRows;
  }

  async eliminarServicio(id) {
    const query = 'DELETE FROM servicios WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows;
  }
}

module.exports = new ServicioDao();
