    class Servicio {
  constructor(id, nombre, descripcion, precio, duracion, disponible) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.duracion = duracion;
    this.disponible = disponible;
  }
}

module.exports = Servicio;