import { setCorsHeaders, handleOptions } from './_cors.js';

export default function handler(req, res) {
  setCorsHeaders(req, res);
  if (handleOptions(req, res)) return;
  return res.status(200).json({ ok: true });
}
