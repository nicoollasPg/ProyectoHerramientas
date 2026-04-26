// Middleware centralizado de manejo de errores

function errorHandler(err, req, res, next) {
    // Log del error para debugging (sin exponer al cliente)
    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        timestamp: new Date().toISOString()
    });

    // Determinar código de status
    const statusCode = err.statusCode || res.statusCode || 500;

    // Mensajes genéricos según el código de error
    const errorMessages = {
        400: 'Solicitud inválida',
        401: 'Acceso no autorizado',
        403: 'Acceso prohibido',
        404: 'Recurso no encontrado',
        429: 'Demasiadas solicitudes',
        500: 'Error interno del servidor'
    };

    // Respuesta segura sin exponer detalles internos
    const response = {
        error: true,
        message: errorMessages[statusCode] || 'Ha ocurrido un error',
        timestamp: new Date().toISOString()
    };

    // En desarrollo, incluir más detalles
    if (process.env.NODE_ENV === 'development') {
        response.details = err.message;
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
}

// Middleware para rutas no encontradas (404)
function notFoundHandler(req, res, next) {
    const error = new Error('Ruta no encontrada');
    error.statusCode = 404;
    next(error);
}

module.exports = {
    errorHandler,
    notFoundHandler
};
