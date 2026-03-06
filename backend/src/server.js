require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const app = express();

const port = parseInt(process.env.PORT || '3440', 10);
const toEmail = process.env.CONTACT_EMAIL;
const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER;
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

  if (!toEmail || !fromEmail || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('Missing SMTP configuration');
    return res.status(500).send({
      success: false,
      errorCode: 'SERVER_CONFIG_ERROR',
      message: 'Configurazione server incompleta.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const text = [
      'Nuovo messaggio da Car Leave Message',
      '',
      `Nome: ${sender}`,
      `Telefono: ${phone || 'non fornito'}`,
      '',
      'Messaggio:',
      content
    ].join('\n');

    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: `[Car] Messaggio da ${sender}`,
      text
    });

    return res.send({ success: true });
  } catch (error) {
    console.error('Mail send error', error);
    return res.status(500).send({ success: false, errorCode: 'MAIL_SEND_ERROR' });
  }
});

app.listen(port, () => {
  console.log(`Car Leave Message backend listening on port ${port}`);
});
