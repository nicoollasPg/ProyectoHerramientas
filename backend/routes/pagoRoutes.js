const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

router.post('/crear', async (req, res) => {
    try {
        const { servicio, precio, reserva_id } = req.body;

        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: [
                    {
                        title: servicio,
                        quantity: 1,
                        unit_price: parseFloat(precio),
                        currency_id: 'PEN'
                    }
                ],
                back_urls: {
                    success: `${process.env.APP_URL || 'https://fadehouse-backend-e7fuchc7c8f9hncv.chilecentral-01.azurewebsites.net'}/reserva.html?pago=exitoso`,
                    failure: `${process.env.APP_URL || 'https://fadehouse-backend-e7fuchc7c8f9hncv.chilecentral-01.azurewebsites.net'}/reserva.html?pago=fallido`,
                    pending: `${process.env.APP_URL || 'https://fadehouse-backend-e7fuchc7c8f9hncv.chilecentral-01.azurewebsites.net'}/reserva.html?pago=pendiente`
                },
                auto_return: 'approved',
                external_reference: String(reserva_id)
            }
        });

        res.json({
            init_point: result.init_point,
            preference_id: result.id
        });

    } catch (error) {
        console.error('Error MercadoPago:', error);
        res.status(500).json({ error: 'Error al crear el pago' });
    }
});

module.exports = router;