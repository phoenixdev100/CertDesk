import { Router } from 'express';
import { testSmtp, sendEmail } from '../controllers/email.controller.js';
import { requireFields } from '../middleware/validate.js';

const router = Router();

router.post('/test-smtp', requireFields('smtp'), testSmtp);
router.post('/send-email', requireFields('smtp', 'to', 'subject', 'attachmentBase64'), sendEmail);

export default router;
