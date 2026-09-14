import nodemailer from 'nodemailer';
import { setCorsHeaders, handleOptions } from './_cors.js';

function createTransporter(smtp) {
  const port = parseInt(smtp.port, 10) || 587;
  return nodemailer.createTransport({
    host: smtp.host,
    port,
    secure: port === 465,
    auth: { user: smtp.user, pass: smtp.pass },
    tls: { rejectUnauthorized: false },
  });
}

function validateFields(body, fields) {
  const missing = fields.filter((f) => !body?.[f]);
  if (missing.length) {
    return `Missing required fields: ${missing.join(', ')}`;
  }
  const smtp = body.smtp;
  if (fields.includes('smtp') && (!smtp.host || !smtp.user || !smtp.pass)) {
    return 'smtp.host, smtp.user and smtp.pass are required';
  }
  return null;
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;
  const validationError = validateFields(body, ['smtp']);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const transporter = createTransporter(body.smtp);
    await transporter.verify();
    return res.status(200).json({ ok: true, message: 'SMTP connection successful' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
