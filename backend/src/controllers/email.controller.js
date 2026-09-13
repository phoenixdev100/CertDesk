import { createTransporter } from '../services/mailer.service.js';

// POST /api/test-smtp - verify credentials without sending a message
export async function testSmtp(req, res) {
  try {
    const transporter = createTransporter(req.body.smtp);
    await transporter.verify();
    res.json({ ok: true, message: 'SMTP connection successful' });
  } catch (err) {
    console.error('SMTP test failed:', err.message);
    res.status(500).json({ error: err.message });
  }
}

// POST /api/send-email - send one certificate PNG attachment
export async function sendEmail(req, res) {
  const { smtp, to, subject, html, attachmentBase64, filename } = req.body;

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
    res.json({ ok: true });
  } catch (err) {
    console.error('Send failed:', err.message);
    res.status(500).json({ error: err.message });
  }
}
