import nodemailer from 'nodemailer';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;
  const validationError = validateFields(body, ['smtp', 'to', 'subject', 'attachmentBase64']);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { smtp, to, subject, html, attachmentBase64, filename } = body;

  try {
    const transporter = createTransporter(smtp);
    await transporter.sendMail({
      from: smtp.fromName ? `"${smtp.fromName}" <${smtp.user}>` : smtp.user,
      to,
      subject,
      html,
      priority: 'high',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        Importance: 'High',
      },
      attachments: [
        {
          filename: filename || 'certificate.png',
          content: attachmentBase64,
          encoding: 'base64',
          contentType: 'image/png',
        },
      ],
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
