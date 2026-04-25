// backend/models/HorarioBarbero.js

class HorarioBarbero {
    constructor(data) {
        this.id = data.id || null;
        this.id_barbero = data.id_barbero;
        this.dia_semana = data.dia_semana; // 1=Domingo, 2=Lunes, ..., 7=Sábado
        this.hora_inicio = data.hora_inicio;
        this.hora_fin = data.hora_fin;
    }

    // Validar que los datos sean correctos
    validar() {
        const errores = [];

        if (!this.id_barbero) {
            errores.push('El ID del barbero es requerido');
        }

        if (!this.dia_semana || this.dia_semana < 1 || this.dia_semana > 7) {
            errores.push('El día de la semana debe estar entre 1 (Domingo) y 7 (Sábado)');
        }

        if (!this.hora_inicio) {
            errores.push('La hora de inicio es requerida');
        }

        if (!this.hora_fin) {
            errores.push('La hora de fin es requerida');
        }

        // Validar que hora_inicio < hora_fin
        if (this.hora_inicio && this.hora_fin && this.hora_inicio >= this.hora_fin) {
            errores.push('La hora de inicio debe ser anterior a la hora de fin');
        }

        return {
            valido: errores.length === 0,
            errores
        };
    }

    // Convertir nombre de día a número
    static diaNombreANumero(nombre) {
        const dias = {
            'domingo': 1,
            'lunes': 2,
            'martes': 3,
            'miércoles': 4,
            'miercoles': 4,
            'jueves': 5,
            'viernes': 6,
            'sábado': 7,
            'sabado': 7
        };
        return dias[nombre.toLowerCase()] || null;
    }

    // Convertir número de día a nombre
    static diaNumeroANombre(numero) {
        const dias = ['', 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return dias[numero] || '';
    }
}

module.exports = HorarioBarbero;
