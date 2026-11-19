import { acknowledgementPath } from '../assets/stakeholder-agreement-shared.js';
import { createGraphMailer } from './graph-mail.mjs';
import { createStakeholderServer } from './stakeholder-acknowledgements.mjs';

const env = process.env;
const sendMail = createGraphMailer({
  tenant: env.NAMIBONE_GRAPH_TENANT_ID,
  clientId: env.NAMIBONE_GRAPH_CLIENT_ID,
  clientSecret: env.NAMIBONE_GRAPH_CLIENT_SECRET,
  sender: env.NAMIBONE_GRAPH_SENDER,
});
const port = Number(env.PORT ?? '8080');
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Use a valid port for the NamibOne form handler.');

const server = createStakeholderServer({ sendMail });
server.listen(port, '0.0.0.0', () => console.log(`NamibOne form handler listening on port ${port} at ${acknowledgementPath}`));
