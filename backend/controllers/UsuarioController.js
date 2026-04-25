const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioDao = require('../dao/UsuarioDao');
const { validatePassword, validateEmail, validateDNI } = require('../middleware/validator');

class UsuarioController {
  // LOGIN
  static async login(req, res) {
    try {
      const { correo, password } = req.body;

      if (!correo || !password) {
        return res.status(400).json({ message: 'Datos incompletos' });
      }

      const usuario = await UsuarioDao.encontrarPorCorreo(correo);
      if (!usuario) {
        // Mensaje generico para no revelar si el usuario existe
        return res.status(401).json({ message: 'Credenciales invalidas' });
      }

      const passwordValido = await bcrypt.compare(password, usuario.hash_contrasena);
      if (!passwordValido) {
        // Mismo mensaje generico
        return res.status(401).json({ message: 'Credenciales invalidas' });
      }

      // Generar token con expiracion
      const token = jwt.sign(
        { id: usuario.id, rol: usuario.rol, nombre_usuario: usuario.nombre_usuario },
        process.env.JWT_SECRET || 'claveultrasecreta',
        { expiresIn: '8h' }
      );

      return res.json({
        token,
        usuario: {
          id: usuario.id,
          nombre_usuario: usuario.nombre_usuario,
          correo: usuario.correo,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      // Mensaje generico sin exponer detalles
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }

  // REGISTRAR
  static async registrar(req, res) {
    try {
      const { nombre_usuario, correo, dni, password, rol } = req.body;

      console.log('--- DEBUG REGISTRO ---');
      console.log('Datos recibidos:', { nombre_usuario, correo, dni, rol, password: '***' });

      if (!nombre_usuario || !correo || !dni || !password || !rol) {
        console.log('Faltan datos');
        return res.status(400).json({ message: 'Datos incompletos' });
      }

      // Validar email
      const emailValidation = validateEmail(correo);
      if (!emailValidation.valid) {
        console.log('Email invalido:', emailValidation.message);
        return res.status(400).json({ message: emailValidation.message });
      }

      // Validar DNI
      const dniValidation = validateDNI(dni);
      if (!dniValidation.valid) {
        console.log('DNI invalido:', dniValidation.message);
        return res.status(400).json({ message: dniValidation.message });
      }

      // Validar fuerza de contraseña
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        console.log('Password invalido:', passwordValidation.message);
        return res.status(400).json({ message: passwordValidation.message });
      }

      // Validar rol permitido
      const rolesPermitidos = ['admin', 'barbero', 'recepcionista', 'cliente'];
      if (!rolesPermitidos.includes(rol)) {
        console.log('Rol invalido:', rol);
        return res.status(400).json({ message: 'Rol invalido' });
      }

      // Hash de contraseña con 12 rounds (mas seguro que 10)
      const hash_contrasena = await bcrypt.hash(password, 12);

      const usuarioId = await UsuarioDao.crearUsuario({
        nombre_usuario,
        hash_contrasena,
        correo,
        dni,
        rol
      });

      res.status(201).json({ message: 'Usuario creado correctamente', usuarioId });
    } catch (error) {
      console.error('Error al registrar:', error);

      // Manejar errores especificos sin exponer detalles del sistema
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'El correo o DNI ya esta registrado' });
      }

      res.status(500).json({ message: 'Error al registrar usuario' });
    }
  }

  // LISTAR BARBEROS
  static async listarBarberos(req, res) {
    try {
      const barberos = await UsuarioDao.listarBarberos();
      if (!barberos.length) {
        return res.json({ message: 'No hay barberos registrados' });
      }
      res.json(barberos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al listar barberos', error: error.message });
    }
  }
  // OBTENER TODOS LOS USUARIOS (solo admin)
  static async obtenerTodos(req, res) {
    try {
      const usuarios = await UsuarioDao.obtenerTodos();
      res.json(usuarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
    }
  }

}

module.exports = UsuarioController;

