const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function enviarCorreoReserva(datos) {
  try {

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: datos.correo,
      subject: 'Reserva Confirmada - Barber House',
      html: `
        <h2>Hola ${datos.nombre_usuario}</h2>

        <p>Tu reserva fue registrada correctamente.</p>

        <ul>
          <li><strong>Servicio:</strong> ${datos.servicio}</li>
          <li><strong>Barbero:</strong> ${datos.barbero}</li>
          <li><strong>Fecha:</strong> ${new Date(datos.fecha_hora).toLocaleString()}</li>
        </ul>

        <p>Gracias por elegir Barber House.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Correo enviado:', info.messageId);

    return info;

  } catch (error) {
    console.error('Error enviando correo:', error);
    throw error;
  }
}

module.exports = {
  enviarCorreoReserva
};