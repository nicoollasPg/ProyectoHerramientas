const pool = require('./config/database');

async function seed() {
    try {
        console.log('--- SEMBRANDO HORARIOS ---');

        // 1. Obtener todos los barberos
        const [barberos] = await pool.execute('SELECT id, nombre_usuario FROM usuarios WHERE rol = "barbero"');

        if (barberos.length === 0) {
            console.log('No hay barberos para asignar horarios.');
            return;
        }

        console.log(`Encontrados ${barberos.length} barberos.`);

        // 2. Asignar horarios Lunes (2) a Domingo (1) de 00:00 a 23:59
        // Domingo=1, Lunes=2, ... Sábado=7
        const dias = [1, 2, 3, 4, 5, 6, 7];
        const horaInicio = '00:00:00';
        const horaFin = '23:59:59';

        for (const barbero of barberos) {
            console.log(`Asignando horarios a: ${barbero.nombre_usuario} (ID: ${barbero.id})`);

            for (const dia of dias) {
                // Verificar si ya existe
                const [existe] = await pool.execute(
                    'SELECT id FROM horarios_barberos WHERE id_barbero = ? AND dia_semana = ?',
                    [barbero.id, dia]
                );

                if (existe.length === 0) {
                    await pool.execute(
                        'INSERT INTO horarios_barberos (id_barbero, dia_semana, hora_inicio, hora_fin) VALUES (?, ?, ?, ?)',
                        [barbero.id, dia, horaInicio, horaFin]
                    );
                    console.log(`  - Día ${dia}: Asignado.`);
                } else {
                    // Si ya existe, ACTUALIZARLO para asegurar que tenga el horario extendido
                    await pool.execute(
                        'UPDATE horarios_barberos SET hora_inicio = ?, hora_fin = ? WHERE id = ?',
                        [horaInicio, horaFin, existe[0].id]
                    );
                    console.log(`  - Día ${dia}: Actualizado a 24h.`);
                }
            }
        }

        console.log('--- SEMILLA COMPLETADA ---');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

seed();
