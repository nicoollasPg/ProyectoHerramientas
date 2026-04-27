// frontend/assets/js/admin-horarios.js
const API_URL = 'http://localhost:3001/api';
let barberoSeleccionado = null;
let horarios = [];

const diasSemana = ['', 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    cargarBarberos();

    document.getElementById('selectBarbero').addEventListener('change', (e) => {
        barberoSeleccionado = e.target.value;
        if (barberoSeleccionado) {
            cargarHorarios(barberoSeleccionado);
            document.getElementById('horariosCard').style.display = 'block';
        } else {
            document.getElementById('horariosCard').style.display = 'none';
        }
    });

    document.getElementById('btnGuardarHorario').addEventListener('click', guardarHorario);
});

// Verificar autenticación
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (!token || usuario.rol !== 'admin') {
        alert('Acceso denegado. Solo administradores.');
        window.location.href = 'login.html';
    }
}

// Cargar lista de barberos
async function cargarBarberos() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/barberos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Error al cargar barberos');

        const barberos = await res.json();
        const select = document.getElementById('selectBarbero');

        barberos.forEach(barbero => {
            const option = document.createElement('option');
            option.value = barbero.id;
            option.textContent = barbero.nombre_usuario;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar barberos');
    }
}

// Cargar horarios de un barbero
async function cargarHorarios(id_barbero) {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/admin/horarios/barbero/${id_barbero}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Error al cargar horarios');

        horarios = await res.json();
        renderizarHorarios();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar horarios');
    }
}

// Renderizar tabla de horarios
function renderizarHorarios() {
    const tbody = document.getElementById('tablaHorarios');
    tbody.innerHTML = '';

    if (horarios.length === 0) {
        tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted">
          No hay horarios configurados para este barbero
        </td>
      </tr>
    `;
        return;
    }

    horarios.forEach(horario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td><strong>${diasSemana[horario.dia_semana]}</strong></td>
      <td>${horario.hora_inicio}</td>
      <td>${horario.hora_fin}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="editarHorario(${horario.id})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="eliminarHorario(${horario.id})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
        tbody.appendChild(tr);
    });
}

// Guardar horario (crear o actualizar)
async function guardarHorario() {
    try {
        const id = document.getElementById('horarioId').value;
        const dia_semana = document.getElementById('dia_semana').value;
        const hora_inicio = document.getElementById('hora_inicio').value;
        const hora_fin = document.getElementById('hora_fin').value;

        if (!dia_semana || !hora_inicio || !hora_fin) {
            alert('Por favor complete todos los campos');
            return;
        }

        if (hora_inicio >= hora_fin) {
            alert('La hora de inicio debe ser anterior a la hora de fin');
            return;
        }

        if (!barberoSeleccionado) {
            alert('Seleccione un barbero primero');
            return;
        }

        const data = {
            id_barbero: parseInt(barberoSeleccionado),
            dia_semana: parseInt(dia_semana),
            hora_inicio: hora_inicio + ':00',
            hora_fin: hora_fin + ':00'
        };

        const token = localStorage.getItem('token');
        const url = id ? `${API_URL}/admin/horarios/${id}` : `${API_URL}/admin/horarios`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.message || 'Error al guardar horario');
        }

        alert(result.message);

        // Cerrar modal y recargar
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalHorario'));
        modal.hide();
        document.getElementById('formHorario').reset();
        document.getElementById('horarioId').value = '';

        cargarHorarios(barberoSeleccionado);
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

// Editar horario
function editarHorario(id) {
    const horario = horarios.find(h => h.id === id);
    if (!horario) return;

    document.getElementById('horarioId').value = horario.id;
    document.getElementById('dia_semana').value = horario.dia_semana;
    document.getElementById('hora_inicio').value = horario.hora_inicio.substring(0, 5);
    document.getElementById('hora_fin').value = horario.hora_fin.substring(0, 5);
    document.getElementById('modalHorarioTitle').textContent = 'Editar Horario';

    const modal = new bootstrap.Modal(document.getElementById('modalHorario'));
    modal.show();
}

// Eliminar horario
async function eliminarHorario(id) {
    if (!confirm('¿Está seguro de eliminar este horario?')) return;

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/admin/horarios/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.message || 'Error al eliminar horario');
        }

        alert(result.message);
        cargarHorarios(barberoSeleccionado);
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

// Reset modal al cerrar
document.getElementById('modalHorario').addEventListener('hidden.bs.modal', () => {
    document.getElementById('formHorario').reset();
    document.getElementById('horarioId').value = '';
    document.getElementById('modalHorarioTitle').textContent = 'Agregar Horario';
});
