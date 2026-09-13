const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || '50mb',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};

export default config;
