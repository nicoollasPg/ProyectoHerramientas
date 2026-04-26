const pool = require('../config/database');
const bcrypt = require('bcrypt');

class UsuarioDAO {
  // Crear usuario
  async crearUsuario(usuarioData) {
    const { nombre_usuario, hash_contrasena, correo, dni, rol } = usuarioData;
    const query = `
      INSERT INTO usuarios (nombre_usuario, hash_contrasena, correo, dni, rol, activo) 
      VALUES (?, ?, ?, ?, ?, TRUE)
    `;
    const [result] = await pool.execute(query, [
      nombre_usuario,
      hash_contrasena,
      correo,
      dni,
      rol
    ]);
    return result.insertId;
  }

  // Buscar usuario por ID
  async encontrarPorId(id) {
    const query = 'SELECT * FROM usuarios WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  }

  // Buscar usuario por correo (para login)
  async encontrarPorCorreo(correo) {
    const query = 'SELECT * FROM usuarios WHERE correo = ?';
    const [rows] = await pool.execute(query, [correo]);
    return rows[0];
  }

  // Buscar usuario por DNI
  async encontrarPorDNI(dni) {
    const query = 'SELECT * FROM usuarios WHERE dni = ?';
    const [rows] = await pool.execute(query, [dni]);
    return rows[0];
  }

  // Listar barberos
  async listarBarberos() {
    const query = "SELECT id, nombre_usuario, correo FROM usuarios WHERE rol = 'barbero'";
    const [rows] = await pool.execute(query);
    return rows;
  }
  // Obtener todos los usuarios (para el panel del administrador)
async obtenerTodos() {
  const query = 'SELECT id, nombre_usuario, correo, dni, rol, activo FROM usuarios';
  const [rows] = await pool.execute(query);
  return rows;
}

}

module.exports = new UsuarioDAO();

