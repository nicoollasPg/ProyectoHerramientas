const ServicioDao = require('../dao/ServicioDao');

class ServicioController {
  static async crear(req, res) {
    try {
      const { nombre, descripcion, precio } = req.body;
      if (!nombre || !precio) {
        return res.status(400).json({ message: 'Faltan datos obligatorios' });
      }
      const id = await ServicioDao.crearServicio({ nombre, descripcion, precio });
      res.status(201).json({ message: 'Servicio creado', id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  static async listar(req, res) {
    try {
      const servicios = await ServicioDao.listarServicios();
      res.json(servicios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al listar servicios' });
    }
  }

  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, precio } = req.body;
      const affectedRows = await ServicioDao.actualizarServicio(id, { nombre, descripcion, precio });
      if (affectedRows === 0) return res.status(404).json({ message: 'Servicio no encontrado' });
      res.json({ message: 'Servicio actualizado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar servicio' });
    }
  }

  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      const affectedRows = await ServicioDao.eliminarServicio(id);
      if (affectedRows === 0) return res.status(404).json({ message: 'Servicio no encontrado' });
      res.json({ message: 'Servicio eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar servicio' });
    }
  }
}

module.exports = ServicioController;
