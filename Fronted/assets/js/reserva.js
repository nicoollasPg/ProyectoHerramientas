// assets/js/reserva.js
document.addEventListener('DOMContentLoaded', () => {
  // Verificar token de sesión
  const token = localStorage.getItem('token');
  if (!token) {
    showAlert('warning', 'Acceso Restringido', 'Debes iniciar sesión para reservar');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return;
  }

  // Cargar barberos dinámicamente
  async function cargarBarberos() {
    try {
      const res = await fetch('http://localhost:3001/api/barberos');
      if (!res.ok) {
        console.error('Error al cargar barberos');
        return;
      }

      const barberos = await res.json();
      const select = document.getElementById('barbero');

      // Limpiar opciones existentes (excepto la primera)
      while (select.options.length > 1) {
        select.remove(1);
      }

      // Agregar barberos al select
      barberos.forEach(barbero => {
        const option = document.createElement('option');
        option.value = barbero.id;
        option.textContent = barbero.nombre_usuario;
        select.appendChild(option);
      });
    } catch (err) {
      console.error('Error al cargar barberos:', err);
      showAlert('error', 'Error', 'No se pudieron cargar los barberos disponibles');
    }
  }

  // Configurar fecha mínima (hoy) usando hora local
  const dateInput = document.getElementById('date');
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;
  dateInput.setAttribute('min', todayString);

  // Llamar la función cuando se carga la página
  cargarBarberos();

  const reservaForm = document.getElementById('reservaForm');

  reservaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      // Obtener usuario logueado
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      if (!usuario || !usuario.id) {
        showAlert('error', 'Sesión Inválida', 'Usuario no válido. Inicia sesión nuevamente.');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
      }

      // Obtener datos del formulario
      const barberoId = parseInt(document.getElementById('barbero').value);
      const servicioId = parseInt(document.getElementById('service').value);
      const fecha = document.getElementById('date').value;
      const hora = document.getElementById('time').value;

      // Validar que la fecha no sea anterior a hoy
      const fechaSeleccionada = new Date(fecha);
      const fechaHoy = new Date();
      fechaHoy.setHours(0, 0, 0, 0);

      if (fechaSeleccionada < fechaHoy) {
        showAlert('warning', 'Fecha Inválida', 'No puedes reservar en fechas pasadas. Selecciona hoy o una fecha futura.');
        return;
      }

      // Si la fecha es HOY, validar que la hora no sea pasada
      const ahora = new Date();
      const [horaSeleccionada, minutosSeleccionados] = hora.split(':').map(Number);
      const fechaHoraReserva = new Date(fecha);
      fechaHoraReserva.setHours(horaSeleccionada, minutosSeleccionados, 0, 0);

      if (fecha === todayString && fechaHoraReserva <= ahora) {
        showAlert('warning', 'Hora Inválida', 'No puedes reservar en horas pasadas. Selecciona una hora futura.');
        return;
      }

      const fecha_hora = `${fecha} ${hora}:00`; // Formato YYYY-MM-DD HH:MM:SS

      const reserva = {
        id_usuario: usuario.id,
        id_barbero: barberoId,
        id_servicio: servicioId,
        fecha_hora,
        codigo_promocion: document.getElementById('codigo_prom').value || null,
        notas: document.getElementById('name').value
      };

      // Validar campos obligatorios
      if (!barberoId || !servicioId || !fecha || !hora) {
        showAlert('warning', 'Campos Incompletos', 'Faltan datos obligatorios');
        return;
      }

      // Enviar la reserva al backend
      const res = await fetch('http://localhost:3001/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reserva)
      });

      const data = await res.json();

      if (res.ok) {
        showAlert('success', 'Reserva Confirmada', 'Tu reserva ha sido registrada con éxito');
        reservaForm.reset();
      } else {
        showAlert('error', 'Error en Reserva', data.message || 'Error al registrar la reserva');
      }
    } catch (err) {
      console.error('Error al enviar la reserva:', err);
      showAlert('error', 'Error de Conexión', 'No se pudo conectar con el servidor');
    }
  });
});
