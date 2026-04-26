const ReservaDAO = require('./dao/ReservaDao');
const pool = require('./config/database');

async function test() {
    try {
        console.log('--- INICIANDO TEST DE DEPURACIÓN ---');

        // 1. Obtener un barbero QUE TENGA horarios
        const [rows] = await pool.execute(`
      SELECT u.id, u.nombre_usuario 
      FROM usuarios u
      INNER JOIN horarios_barberos h ON u.id = h.id_barbero
      WHERE u.rol = "barbero"
      LIMIT 1
    `);

        if (rows.length === 0) {
            console.log('No hay barberos con horarios configurados en la base de datos.');
            // Listar todos los barberos para info
            const [todos] = await pool.execute('SELECT id, nombre_usuario FROM usuarios WHERE rol = "barbero"');
            console.log('Barberos existentes (sin horarios):', todos);
            return;
        }
        const barbero = rows[0];
        console.log('Barbero con horarios encontrado:', barbero);

        const [horarios] = await pool.execute('SELECT * FROM horarios_barberos WHERE id_barbero = ?', [barbero.id]);
        console.log('Horarios del barbero:', horarios);

        // 2. Obtener un servicio
        const [servicios] = await pool.execute('SELECT id, nombre, duracion_minutos FROM servicios LIMIT 1');
        if (servicios.length === 0) {
            console.log('No hay servicios en la base de datos.');
            return;
        }
        const servicio = servicios[0];
        console.log('Servicio encontrado:', servicio);

        // 3. Construir una fecha válida basada en el primer horario encontrado
        const horario = horarios[0];
        const diaSemanaHorario = horario.dia_semana; // 1=Domingo, ...

        // Encontrar el próximo día de la semana que coincida
        const hoy = new Date();
        const diaHoy = hoy.getDay() + 1;
        let diasParaSumar = diaSemanaHorario - diaHoy;
        if (diasParaSumar < 0) diasParaSumar += 7;

        const fechaPrueba = new Date(hoy);
        fechaPrueba.setDate(hoy.getDate() + diasParaSumar);

        // Establecer hora dentro del rango (e.g., hora_inicio + 1 hora)
        // hora_inicio viene como 'HH:MM:SS'
        const [hora, minuto] = horario.hora_inicio.split(':');
        fechaPrueba.setHours(parseInt(hora) + 1, parseInt(minuto), 0, 0);

        const fechaHoraStr = fechaPrueba.toISOString();

        console.log(`Probando validación para: ${fechaHoraStr} (Local: ${fechaPrueba.toString()})`);

        // 4. Llamar a validarDisponibilidad
        try {
            const resultado = await ReservaDAO.validarDisponibilidad(barbero.id, fechaHoraStr, servicio.id);
            console.log('Resultado de validación:', resultado);
        } catch (error) {
            console.error('Error en validación:', error);
        }

    } catch (err) {
        console.error('Error general:', err);
    } finally {
        process.exit();
    }
}

test();
