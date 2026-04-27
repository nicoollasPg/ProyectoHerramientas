const API_URL = "http://localhost:3001/api";
const token = localStorage.getItem('token');

if (!token) {
  showAlert('error', 'Sesión Expirada', 'No tienes una sesión activa. Inicia sesión nuevamente.');
  setTimeout(() => window.location.href = "index.html", 1500);
}

const headersAuth = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`
};

async function cargarServicios() {
  try {
    const res = await fetch(`${API_URL}/admin/servicios`, { headers: headersAuth });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const servicios = await res.json();

    const tbody = document.querySelector("#tablaServicios tbody");
    tbody.innerHTML = "";

    servicios.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.id}</td>
        <td>${s.nombre}</td>
        <td>S/ ${s.precio}</td>
        <td>
          <button class="btn btn-warning btn-sm btnEditar" 
            data-id="${s.id}" data-nombre="${s.nombre}" data-precio="${s.precio}">Editar</button>
          <button class="btn btn-danger btn-sm btnEliminar" data-id="${s.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error al cargar servicios:", err);
  }
}

async function guardarServicio(e) {
  e.preventDefault();
  const id = document.querySelector("#idServicio").value;
  const nombre = document.querySelector("#nombreServicio").value.trim();
  const precio = document.querySelector("#precioServicio").value;

  if (!nombre || !precio) {
    alert("Nombre y precio son obligatorios");
    return;
  }

  const data = { nombre, precio };
  let url = `${API_URL}/servicios`;
  let method = "POST";

  if (id) {
    url += `/${id}`;
    method = "PUT";
  }

  try {
    const res = await fetch(url, {
      method,
      headers: headersAuth,
      body: JSON.stringify(data)
    });

    showAlert('success', 'Éxito', json.message);
    document.querySelector("#formServicio").reset();
    cargarServicios();
  } catch (err) {
    console.error("Error al guardar servicio:", err);
    showAlert('error', 'Error', 'Error al guardar el servicio');
  }
}

async function eliminarServicio(id) {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "No podrás revertir esto",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`${API_URL}/servicios/${id}`, {
      method: "DELETE",
      headers: headersAuth
    });
    const json = await res.json();
    showAlert('success', 'Eliminado', json.message);
    cargarServicios();
  } catch (err) {
    console.error("Error al eliminar servicio:", err);
    showAlert('error', 'Error', 'Error al eliminar el servicio');
  }
}

// ======================
// FUNCIONES DE RESERVAS
// ======================
async function cargarReservas() {
  try {
    const res = await fetch(`${API_URL}/reservas`, { headers: headersAuth });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const reservas = await res.json();

    const tbody = document.querySelector("#tablaReservas tbody");
    tbody.innerHTML = "";

    reservas.forEach((r) => {
      const tr = document.createElement("tr");

      // Determinar color del badge segun el estado
      let badgeClass = "bg-warning"; // pendiente (amarillo)
      if (r.estado === "confirmada") badgeClass = "bg-primary";   // azul
      if (r.estado === "completada") badgeClass = "bg-success";   // verde
      if (r.estado === "cancelada") badgeClass = "bg-danger";     // rojo

      // Determinar botones de accion segun el estado
      let botonesAccion = "";
      if (r.estado === "pendiente") {
        botonesAccion = `
          <button class="btn btn-primary btn-sm btnMarcarConfirmada" data-id="${r.id}">
            <i class="fas fa-check-circle me-1"></i>Confirmar
          </button>
          <button class="btn btn-danger btn-sm btnMarcarCancelada" data-id="${r.id}">
            <i class="fas fa-times me-1"></i>Cancelar
          </button>
        `;
      } else if (r.estado === "confirmada") {
        botonesAccion = `
          <button class="btn btn-success btn-sm btnMarcarCompletada" data-id="${r.id}">
            <i class="fas fa-check-double me-1"></i>Completar
          </button>
          <button class="btn btn-danger btn-sm btnMarcarCancelada" data-id="${r.id}">
            <i class="fas fa-ban me-1"></i>Cancelar
          </button>
        `;
      } else if (r.estado === "cancelada") {
        botonesAccion = `
          <button class="btn btn-warning btn-sm btnMarcarPendiente" data-id="${r.id}">
            <i class="fas fa-undo me-1"></i>Restaurar
          </button>
        `;
      } else {
        botonesAccion = `<span class="text-muted"><i class="fas fa-check-circle"></i> Finalizada</span>`;
      }

      tr.innerHTML = `
        <td>${r.id}</td>
        <td>${r.usuario_nombre || "Invitado"}</td>
        <td>${r.barbero_nombre || ""}</td>
        <td>${r.servicio_nombre || ""}</td>
        <td>${new Date(r.fecha_hora).toLocaleString()}</td>
        <td><span class="badge ${badgeClass}">${r.estado.toUpperCase()}</span></td>
        <td>${r.notas || ""}</td>
        <td>${botonesAccion}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error cargando reservas:", err);
  }
}

// Cambiar estado de una reserva
async function cambiarEstadoReserva(id, nuevoEstado) {
  try {
    const res = await fetch(`${API_URL}/reservas/${id}/estado`, {
      method: "PATCH",
      headers: headersAuth,
      body: JSON.stringify({ estado: nuevoEstado })
    });

    if (res.status === 401 || res.status === 403) {
      showAlert('error', 'Sesión Expirada', 'Sesión expirada');
      window.location.href = "index.html";
      return;
    }

    const data = await res.json();

    if (res.ok) {
      showAlert('success', 'Éxito', data.message || "Estado actualizado correctamente");
      cargarReservas(); // Recargar la tabla
    } else {
      showAlert('error', 'Error', data.message || "Error al actualizar el estado");
    }
  } catch (err) {
    console.error("Error al cambiar estado:", err);
    showAlert('error', 'Error', "Error al cambiar el estado de la reserva");
  }
}

// Actualizar automaticamente todas las reservas pasadas
async function actualizarReservasPasadas() {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "¿Deseas actualizar automaticamente todas las reservas pasadas a 'completada'?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, actualizar',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`${API_URL}/reservas/actualizar-pasadas`, {
      method: "POST",
      headers: headersAuth
    });

    const data = await res.json();

    if (res.ok) {
      let mensaje = `${data.message}\n\n`;
      mensaje += `Reservas actualizadas: ${data.reservas_actualizadas}\n\n`;
      showAlert('success', 'Actualización Completa', mensaje);
      cargarReservas();
    } else {
      showAlert('error', 'Error', data.message || "Error al actualizar reservas pasadas");
    }
  } catch (err) {
    console.error("Error al actualizar reservas pasadas:", err);
    showAlert('error', 'Error', "Error al actualizar reservas pasadas");
  }
}

// ======================
// FUNCIONES DE BARBEROS
// ======================
async function cargarBarberos() {
  try {
    const res = await fetch(`${API_URL}/barberos`, { headers: headersAuth });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const barberos = await res.json();

    const tbody = document.querySelector("#tablaBarberos tbody");
    tbody.innerHTML = "";

    barberos.forEach((b) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${b.id}</td>
        <td>${b.nombre_usuario}</td>
        <td>${b.correo}</td>
        <td>
          <button class="btn btn-danger btn-sm">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error cargando barberos:", err);
  }
}

// ======================
// EVENTOS
// ======================
// ======================
// EVENTOS
// ======================
document.addEventListener("DOMContentLoaded", () => {
  // Solo cargar si existe la tabla correspondiente
  if (document.querySelector("#tablaServicios")) cargarServicios();
  if (document.querySelector("#tablaReservas")) cargarReservas();
  if (document.querySelector("#tablaBarberos")) cargarBarberos();

  const formServicio = document.querySelector("#formServicio");
  if (formServicio) {
    formServicio.addEventListener("submit", guardarServicio);
  }

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btnEliminar")) {
      eliminarServicio(e.target.dataset.id);
    }

    if (e.target.classList.contains("btnEditar")) {
      const idInput = document.querySelector("#idServicio");
      const nombreInput = document.querySelector("#nombreServicio");
      const precioInput = document.querySelector("#precioServicio");

      if (idInput && nombreInput && precioInput) {
        idInput.value = e.target.dataset.id;
        nombreInput.value = e.target.dataset.nombre;
        precioInput.value = e.target.dataset.precio;
      }
    }

    if (e.target.id === "btnCancelarServicio") {
      const form = document.querySelector("#formServicio");
      if (form) form.reset();
    }

    // Eventos para botones de estado de reserva
    if (e.target.closest(".btnMarcarConfirmada")) {
      const id = e.target.closest(".btnMarcarConfirmada").dataset.id;
      cambiarEstadoReserva(id, "confirmada");
    }

    if (e.target.closest(".btnMarcarCompletada")) {
      const id = e.target.closest(".btnMarcarCompletada").dataset.id;
      cambiarEstadoReserva(id, "completada");
    }

    if (e.target.closest(".btnMarcarCancelada")) {
      const id = e.target.closest(".btnMarcarCancelada").dataset.id;
      cambiarEstadoReserva(id, "cancelada");
    }

    if (e.target.closest(".btnMarcarPendiente")) {
      const id = e.target.closest(".btnMarcarPendiente").dataset.id;
      cambiarEstadoReserva(id, "pendiente");
    }
  });

  // Boton de actualizar reservas pasadas
  const btnActualizar = document.querySelector("#btnActualizarPasadas"); // Corregido ID segun HTML
  if (btnActualizar) {
    btnActualizar.addEventListener("click", actualizarReservasPasadas);
  }

  // Boton de exportar Excel
  const btnExportar = document.querySelector("#btnExportarExcel");
  if (btnExportar) {
    btnExportar.addEventListener("click", descargarReporteExcel);
  }
});

// Descargar reporte Excel
async function descargarReporteExcel() {
  try {
    const btn = document.querySelector("#btnExportarExcel");
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generando...';
    btn.disabled = true;

    const res = await fetch(`${API_URL}/admin/reportes/excel`, {
      headers: headersAuth
    });

    if (res.status === 401 || res.status === 403) {
      showAlert('error', 'Sesión Expirada', 'Sesión expirada');
      window.location.href = "index.html";
      return;
    }

    if (!res.ok) throw new Error("Error al generar reporte");

    // Manejar descarga de archivo blob
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_reservas_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

  } catch (err) {
    console.error("Error descargando excel:", err);
    showAlert('error', 'Error', "Error al descargar el reporte");
  } finally {
    const btn = document.querySelector("#btnExportarExcel");
    if (btn) {
      btn.innerHTML = '<i class="fas fa-file-excel me-2"></i>Exportar Excel';
      btn.disabled = false;
    }
  }
}
