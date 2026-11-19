import { acknowledgementText, contact } from '../assets/stakeholder-agreement-shared.js';

const guid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export function createGraphMailer({ tenant, clientId, clientSecret, sender, request = fetch }) {
  if (!guid.test(tenant) || !guid.test(clientId) || !clientSecret || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender ?? '')) {
    throw new Error('Set the NamibOne Graph tenant, client, secret and sender mailbox before starting the form handler.');
  }

  return async data => {
    const signal = AbortSignal.timeout(12_000);
    const tokenResponse = await request(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: 'POST',
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: 'https://graph.microsoft.com/.default',
      }),
      redirect: 'error',
      signal,
    });
    if (!tokenResponse.ok) throw new Error('The mail service could not authenticate.');
    const { access_token: token } = await tokenResponse.json();
    if (!token) throw new Error('The mail service did not issue a token.');

    const response = await request(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          subject: `NamibOne stakeholder acknowledgement ${data.acknowledgement_reference}`,
          body: { contentType: 'Text', content: acknowledgementText(data) },
          toRecipients: [{ emailAddress: { address: contact } }],
          replyTo: [{ emailAddress: { address: data.email } }],
        },
        saveToSentItems: true,
      }),
      redirect: 'error',
      signal,
    });
    if (response.status !== 202) throw new Error('The mail service did not accept the acknowledgement.');
  };
}
