// assets/js/reserva.js
document.addEventListener('DOMContentLoaded', () => {
  // Verificar token de sesión
  const token = localStorage.getItem('token');
  if (!token) {
    showAlert('warning', 'Acceso Restringido', 'Debes iniciar sesión para reservar');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return;
  }

  // Ocultar botón si ya se inició un pago
  if (localStorage.getItem('pago_iniciado') === 'true') {
    localStorage.removeItem('pago_iniciado');
    document.getElementById('pagoContainer').style.display = 'none';
  }

  // Escuchar cambios en localStorage desde otra pestaña
  window.addEventListener('storage', (e) => {
    if (e.key === 'pago_iniciado' && e.newValue === 'true') {
      document.getElementById('pagoContainer').style.display = 'none';
      localStorage.removeItem('pago_iniciado');
    }
  });

  // Cargar barberos dinámicamente
  async function cargarBarberos() {
    try {
      const res = await fetch('https://fadehouse-backend-e7fuchc7c8f9hncv.chilecentral-01.azurewebsites.net/api/barberos');
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
      const res = await fetch('https://fadehouse-backend-e7fuchc7c8f9hncv.chilecentral-01.azurewebsites.net/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reserva)
      });

      const data = await res.json();

      if (res.ok) {
        const reservaId = data.id || data.reserva_id || 1;
  
  // Obtener precio del servicio seleccionado
    const servicioSelect = document.getElementById('service');
    const servicioTexto = servicioSelect.options[servicioSelect.selectedIndex].text;
    const precioMatch = servicioTexto.match(/S\/\.(\d+)/);
    const precio = precioMatch ? parseFloat(precioMatch[1]) : 25;
    const nombreServicio = servicioTexto.split(' - ')[0];

  // Crear pago en MercadoPago
    const pagoRes = await fetch('https://fadehouse-backend-e7fuchc7c8f9hncv.chilecentral-01.azurewebsites.net/api/pagos/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ servicio: nombreServicio, precio, reserva_id: reservaId })
      });

    const pagoData = await pagoRes.json();

    if (pagoData.init_point) {
      document.getElementById('pagoContainer').style.display = 'block';
  showAlert('success', 'Reserva Confirmada', 'Tu reserva ha sido registrada. Procede con el pago.');
  
  const btnPagar = document.getElementById('btnPagar');
  btnPagar.replaceWith(btnPagar.cloneNode(true));
  
  document.getElementById('btnPagar').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('pagoContainer').style.display = 'none';
    window.open(pagoData.init_point, '_blank');
    
    document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    document.getElementById('pagoContainer').style.display = 'none';
    document.getElementById('pagoContainer').innerHTML = '';
  }
}, { once: true });
  });
    }
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
