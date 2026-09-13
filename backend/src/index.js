import 'dotenv/config';
import { createApp } from './app.js';
import config from './config.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`CertDesk API listening on http://localhost:${config.port}`);
});
