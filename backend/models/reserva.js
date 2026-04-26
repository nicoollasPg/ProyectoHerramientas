class Reserva {
  constructor(id, fecha_hora, estado, usuario_id, barbero_id, servicio_id, notas, fecha_creacion) {
    this.id = id;
    this.fecha_hora = fecha_hora;
    this.estado = estado;
    this.usuario_id = usuario_id;
    this.barbero_id = barbero_id;
    this.servicio_id = servicio_id;
    this.notas = notas;
    this.fecha_creacion = fecha_creacion;
  }

  esPendiente() {
    return this.estado === 'pendiente';
  }

  esConfirmada() {
    return this.estado === 'confirmada';
  }
}

module.exports = Reserva;