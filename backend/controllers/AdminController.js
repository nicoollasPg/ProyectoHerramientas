const ServicioDao = require('../dao/ServicioDao');
const UsuarioDao = require('../dao/UsuarioDao');
const ReservaDao = require('../dao/ReservaDao');

class AdminController {
  // --- Servicios ---
 static async listarServicios(req, res) {
  try {
    const servicios = await ServicioDao.listarServicios();
    res.json(servicios);
  } catch (error) {
    console.error('Error en listarServicios:', error);
    res.status(500).json({ message: 'Error al listar servicios' });
  }
}


  static async crearServicio(req, res) {
    const { nombre, precio } = req.body;
    if (!nombre || !precio) return res.status(400).json({ message: 'Faltan datos' });
    const id = await ServicioDao.crearServicio({ nombre, precio });
    res.status(201).json({ message: 'Servicio creado', id });
  }

  static async actualizarServicio(req, res) {
    const { id } = req.params;
    const { nombre, precio } = req.body;
    await ServicioDao.actualizarServicio(id, { nombre, precio });
    res.json({ message: 'Servicio actualizado' });
  }

  static async eliminarServicio(req, res) {
    const { id } = req.params;
    await ServicioDao.eliminarServicio(id);
    res.json({ message: 'Servicio eliminado' });
  }

  // --- Barberos ---
  static async listarBarberos(req, res) {
    const barberos = await UsuarioDao.listarBarberos();
    res.json(barberos);
  }

  static async crearBarbero(req, res) {
    const { nombre_usuario, correo, dni, password } = req.body;
    if (!nombre_usuario || !correo || !dni || !password) return res.status(400).json({ message: 'Faltan datos' });
    const id = await UsuarioDao.crearUsuario({ nombre_usuario, correo, dni, rol: 'barbero', hash_contrasena: password });
    res.status(201).json({ message: 'Barbero creado', id });
  }

  static async actualizarBarbero(req, res) {
    const { id } = req.params;
    const { nombre_usuario, correo, dni } = req.body;
    await UsuarioDao.actualizarBarbero(id, { nombre_usuario, correo, dni });
    res.json({ message: 'Barbero actualizado' });
  }

  static async eliminarBarbero(req, res) {
    const { id } = req.params;
    await UsuarioDao.eliminarUsuario(id);
    res.json({ message: 'Barbero eliminado' });
  }

  // --- Reservas ---
  static async listarReservas(req, res) {
    const reservas = await ReservaDao.obtenerReservas();
    res.json(reservas);
  }

  static async actualizarReserva(req, res) {
    const { id } = req.params;
    const { estado, notas, precio_final } = req.body;
    await ReservaDao.actualizarReserva(id, { estado, notas, precio_final });
    res.json({ message: 'Reserva actualizada' });
  }

  static async eliminarReserva(req, res) {
    const { id } = req.params;
    await ReservaDao.eliminarReserva(id);
    res.json({ message: 'Reserva eliminada' });
  }
}

module.exports = AdminController;
