import nodemailer from 'nodemailer';

// Builds a fresh transporter per request so each caller can use
// their own SMTP credentials - nothing is stored server-side.
export function createTransporter(smtp) {
  const port = parseInt(smtp.port, 10) || 587;
  return nodemailer.createTransport({
    host: smtp.host,
    port,
    secure: port === 465,
    auth: { user: smtp.user, pass: smtp.pass },
    tls: { rejectUnauthorized: false },
  });
}
