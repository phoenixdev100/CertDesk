// Rejects requests whose body is missing the given top-level fields,
// or whose smtp block is missing host/user/pass.
export function requireFields(...fields) {
  return (req, res, next) => {
    const missing = fields.filter((f) => !req.body?.[f]);
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const smtp = req.body.smtp;
    if (fields.includes('smtp') && (!smtp.host || !smtp.user || !smtp.pass)) {
      return res.status(400).json({ error: 'smtp.host, smtp.user and smtp.pass are required' });
    }

    next();
  };
}
