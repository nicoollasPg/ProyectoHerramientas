const validator = require('validator');

// Validar fuerza de contraseña
function validatePassword(password) {
    if (!password || password.length < 8) {
        return {
            valid: false,
            message: 'La contraseña debe tener al menos 8 caracteres'
        };
    }

    // Verificar que tenga al menos una mayúscula
    if (!/[A-Z]/.test(password)) {
        return {
            valid: false,
            message: 'La contraseña debe contener al menos una letra mayúscula'
        };
    }

    // Verificar que tenga al menos una minúscula
    if (!/[a-z]/.test(password)) {
        return {
            valid: false,
            message: 'La contraseña debe contener al menos una letra minúscula'
        };
    }

    // Verificar que tenga al menos un número
    if (!/[0-9]/.test(password)) {
        return {
            valid: false,
            message: 'La contraseña debe contener al menos un número'
        };
    }

    // Verificar que tenga al menos un símbolo
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return {
            valid: false,
            message: 'La contraseña debe contener al menos un símbolo especial (!@#$%^&*)'
        };
    }

    return { valid: true };
}

// Sanitizar string contra XSS
function sanitizeString(str) {
    if (!str) return str;

    // Escapar caracteres HTML
    return validator.escape(str.toString());
}

// Validar email
function validateEmail(email) {
    if (!email || !validator.isEmail(email)) {
        return {
            valid: false,
            message: 'Email inválido'
        };
    }

    return { valid: true };
}

// Validar DNI (8 dígitos)
function validateDNI(dni) {
    if (!dni || !/^\d{8}$/.test(dni)) {
        return {
            valid: false,
            message: 'DNI debe tener 8 dígitos'
        };
    }

    return { valid: true };
}

// Middleware para sanitizar inputs
function sanitizeInputs(req, res, next) {
    // Sanitizar body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                // No sanitizar contraseñas
                if (key !== 'password' && key !== 'hash_contrasena') {
                    req.body[key] = sanitizeString(req.body[key]);
                }
            }
        });
    }

    // Sanitizar query params
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitizeString(req.query[key]);
            }
        });
    }

    next();
}

module.exports = {
    validatePassword,
    sanitizeString,
    validateEmail,
    validateDNI,
    sanitizeInputs
};
