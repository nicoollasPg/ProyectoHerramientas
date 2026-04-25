class Usuario {
  constructor(id, nombre_usuario, correo, dni, rol, fecha_creacion) {
    this.id = id;
    this.nombre_usuario = nombre_usuario;
    this.correo = correo;
    this.dni = dni;
    this.rol = rol;
    this.fecha_creacion = fecha_creacion;
  }

  // Validar rol
  esAdmin() {
    return this.rol === 'admin';
  }

  esBarbero() {
    return this.rol === 'barbero';
  }

  esCliente() {
    return this.rol === 'cliente';
  }
}

module.exports = Usuario;