const ExcelJS = require('exceljs');
const QuickChart = require('quickchart-js');
const pool = require('../config/database');

const ReporteController = {
    async generarExcel(req, res) {
        try {
            const [reservas] = await pool.query(`
        SELECT r.id, u.nombre_usuario as cliente, b.nombre_usuario as barbero, 
               s.nombre as servicio, s.precio, r.fecha_hora, r.estado, r.notas
        FROM reservas r
        LEFT JOIN usuarios u ON r.id_usuario = u.id
        LEFT JOIN usuarios b ON r.id_barbero = b.id
        LEFT JOIN servicios s ON r.id_servicio = s.id
        ORDER BY r.fecha_hora DESC
      `);

            const estados = {};
            const servicios = {};
            let totalIngresos = 0;

            reservas.forEach(r => {
                estados[r.estado] = (estados[r.estado] || 0) + 1;
                const servicioNombre = r.servicio || 'Sin servicio';
                servicios[servicioNombre] = (servicios[servicioNombre] || 0) + 1;
                if (['confirmada', 'completada'].includes(r.estado)) {
                    totalIngresos += parseFloat(r.precio || 0);
                }
            });

            let imageEstados = null;
            let imageServicios = null;

            try {
                console.log('Generando gráfico de estados...');
                const chartEstados = new QuickChart();
                chartEstados.setConfig({
                    type: 'pie',
                    data: {
                        labels: Object.keys(estados),
                        datasets: [{ label: 'Reservas', data: Object.values(estados) }]
                    }
                });
                imageEstados = await chartEstados.toBinary();
            } catch (err) {
                console.error('Error generando gráfico de estados:', err.message);
            }

            try {
                console.log('Generando gráfico de servicios...');
                const chartServicios = new QuickChart();
                chartServicios.setConfig({
                    type: 'bar',
                    data: {
                        labels: Object.keys(servicios),
                        datasets: [{ label: 'Solicitudes', data: Object.values(servicios) }]
                    }
                });
                imageServicios = await chartServicios.toBinary();
            } catch (err) {
                console.error('Error generando gráfico de servicios:', err.message);
            }

            console.log('Creando archivo Excel...');
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'BarberHouse Admin';
            workbook.created = new Date();

            const sheetDashboard = workbook.addWorksheet('Dashboard', {
                views: [{ showGridLines: false }]
            });

            // Título Principal
            sheetDashboard.mergeCells('B2:K3');
            const titleCell = sheetDashboard.getCell('B2');
            titleCell.value = 'DASHBOARD DE RESERVAS - BARBERHOUSE';
            titleCell.font = { name: 'Arial', size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
            titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A1A' } }; // Negro
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            titleCell.border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

            // Tarjetas de Métricas
            // Total Reservas
            sheetDashboard.mergeCells('B5:E6');
            const labelReservas = sheetDashboard.getCell('B5');
            labelReservas.value = 'TOTAL RESERVAS';
            labelReservas.font = { bold: true, color: { argb: 'FF000000' } };
            labelReservas.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD700' } }; // Dorado
            labelReservas.alignment = { horizontal: 'center', vertical: 'middle' };
            labelReservas.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

            sheetDashboard.mergeCells('B7:E9');
            const valReservas = sheetDashboard.getCell('B7');
            valReservas.value = reservas.length;
            valReservas.font = { size: 24, bold: true };
            valReservas.alignment = { horizontal: 'center', vertical: 'middle' };
            valReservas.border = { bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };

            // Ingresos Estimados
            sheetDashboard.mergeCells('H5:K6');
            const labelIngresos = sheetDashboard.getCell('H5');
            labelIngresos.value = 'INGRESOS ESTIMADOS';
            labelIngresos.font = { bold: true, color: { argb: 'FF000000' } };
            labelIngresos.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD700' } }; // Dorado
            labelIngresos.alignment = { horizontal: 'center', vertical: 'middle' };
            labelIngresos.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

            sheetDashboard.mergeCells('H7:K9');
            const valIngresos = sheetDashboard.getCell('H7');
            valIngresos.value = totalIngresos;
            valIngresos.numFmt = '"S/ "0.00';
            valIngresos.font = { size: 24, bold: true, color: { argb: 'FF2E8B57' } }; // Verde
            valIngresos.alignment = { horizontal: 'center', vertical: 'middle' };
            valIngresos.border = { bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };

            // Insertar imágenes
            if (imageEstados) {
                const imageId1 = workbook.addImage({
                    buffer: imageEstados,
                    extension: 'png',
                });
                // Ajustar posición para que quede debajo de las tarjetas
                sheetDashboard.addImage(imageId1, {
                    tl: { col: 1, row: 11 }, // B12
                    ext: { width: 400, height: 300 }
                });
            }

            if (imageServicios) {
                const imageId2 = workbook.addImage({
                    buffer: imageServicios,
                    extension: 'png',
                });
                sheetDashboard.addImage(imageId2, {
                    tl: { col: 7, row: 11 }, // H12
                    ext: { width: 400, height: 300 }
                });
            }

            // --- HOJA 2: DETALLE ---
            const sheetDetalle = workbook.addWorksheet('Detalle de Reservas');

            sheetDetalle.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'CLIENTE', key: 'cliente', width: 25 },
                { header: 'BARBERO', key: 'barbero', width: 20 },
                { header: 'SERVICIO', key: 'servicio', width: 25 },
                { header: 'PRECIO', key: 'precio', width: 15 },
                { header: 'FECHA Y HORA', key: 'fecha', width: 25 },
                { header: 'ESTADO', key: 'estado', width: 15 },
                { header: 'NOTAS', key: 'notas', width: 40 },
            ];

            // Estilo de cabecera
            const headerRow = sheetDetalle.getRow(1);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1A1A1A' } // Negro
            };
            headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
            headerRow.height = 30;

            // Agregar filas con estilos alternados
            reservas.forEach((r, index) => {
                const row = sheetDetalle.addRow({
                    id: r.id,
                    cliente: r.cliente || 'Invitado',
                    barbero: r.barbero || 'Cualquiera',
                    servicio: r.servicio,
                    precio: parseFloat(r.precio || 0),
                    fecha: new Date(r.fecha_hora).toLocaleString(),
                    estado: r.estado.toUpperCase(),
                    notas: r.notas
                });

                // Alineación y bordes
                row.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    if (colNumber !== 2 && colNumber !== 8) { // No centrar Cliente ni Notas
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    } else {
                        cell.alignment = { vertical: 'middle' };
                    }
                });

                // Formato moneda
                row.getCell('precio').numFmt = '"S/ "0.00';

                // Color de estado
                const cellEstado = row.getCell('estado');
                if (r.estado === 'confirmada') cellEstado.font = { color: { argb: 'FF0000FF' }, bold: true };
                if (r.estado === 'completada') cellEstado.font = { color: { argb: 'FF008000' }, bold: true };
                if (r.estado === 'cancelada') cellEstado.font = { color: { argb: 'FFFF0000' }, bold: true };
            });

            // Auto-filtro
            sheetDetalle.autoFilter = {
                from: 'A1',
                to: {
                    row: 1,
                    column: 8
                }
            };

            // 5. Enviar respuesta
            console.log('Enviando respuesta...');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=reporte_reservas.xlsx');

            await workbook.xlsx.write(res);
            res.end();
            console.log('Reporte enviado correctamente.');

        } catch (error) {
            console.error('Error CRÍTICO generando reporte:', error);
            // Si ya se enviaron headers, no podemos enviar json
            if (!res.headersSent) {
                res.status(500).json({ message: 'Error al generar el reporte: ' + error.message });
            }
        }
    }
};

module.exports = ReporteController;
