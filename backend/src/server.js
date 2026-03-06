require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1); // Required when behind Apache/nginx reverse proxy

const port = parseInt(process.env.PORT || '3440', 10);
const haUrl = process.env.HA_URL;           // es. https://ha.ammiratafabiano.dev
const haToken = process.env.HA_TOKEN;       // Long-Lived Access Token HA
const haService = process.env.HA_NOTIFY_SERVICE; // es. notify/mobile_app_mio_telefono

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8100,https://car.ammiratafabiano.dev')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);

app.use(express.json({ limit: '64kb' }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  }
}));

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    errorCode: 'TOO_MANY_REQUESTS',
    message: 'Troppi messaggi in poco tempo, riprova tra qualche minuto.'
  }
});

app.get('/health', (_req, res) => {
  res.send({ success: true });
});

app.post('/car/leaveMessage', limiter, async (req, res) => {
  const sender = typeof req.body.sender === 'string' ? req.body.sender.trim() : '';
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
  const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';

  if (!sender || !content) {
    return res.status(400).send({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      message: 'Nome e messaggio sono obbligatori.'
    });
  }

  if (sender.length > 80 || content.length > 1500 || phone.length > 30) {
    return res.status(400).send({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      message: 'Input non valido.'
    });
  }

  if (!haUrl || !haToken || !haService) {
    console.error('Missing Home Assistant configuration (HA_URL, HA_TOKEN, HA_NOTIFY_SERVICE)');
    return res.status(500).send({
      success: false,
      errorCode: 'SERVER_CONFIG_ERROR',
      message: 'Configurazione server incompleta.'
    });
  }

  try {
    const phoneText = phone ? `\nTelefono: ${phone}` : '';
    const message = `${sender} ha lasciato un messaggio:${phoneText}\n\n${content}`;

    const haResponse = await fetch(`${haUrl}/api/services/${haService}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `[Car] Messaggio da ${sender}`,
        message,
      }),
    });

    if (!haResponse.ok) {
      const errText = await haResponse.text();
      console.error('HA API error', haResponse.status, errText);
      return res.status(500).send({ success: false, errorCode: 'HA_NOTIFY_ERROR' });
    }

    return res.send({ success: true });
  } catch (error) {
    console.error('HA notify error', error);
    return res.status(500).send({ success: false, errorCode: 'HA_NOTIFY_ERROR' });
  }
});

app.listen(port, () => {
  console.log(`Car Leave Message backend listening on port ${port}`);
});
