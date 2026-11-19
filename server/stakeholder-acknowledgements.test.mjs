import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import test from 'node:test';
import { acknowledgementPath, contact, version, versionDate } from '../assets/stakeholder-agreement-shared.js';
import { createGraphMailer } from './graph-mail.mjs';
import { createStakeholderServer } from './stakeholder-acknowledgements.mjs';

const siteOrigin = 'https://namibone.com';
const fixture = () => ({
  full_name: 'Synthetic Pilot Tester',
  email: 'stakeholder@example.com',
  capacity: 'Individual',
  role: 'Community or pilot participant',
  intent: 'Try the sample user journeys and report barriers.',
  conflict: 'None known',
  accept_terms: 'Accepted',
  confirm_authority: 'Confirmed',
  signature: 'Synthetic Pilot Tester',
  agreement_version: version,
  agreement_date: versionDate,
  acknowledged_at_utc: new Date().toISOString(),
  acknowledgement_reference: randomUUID(),
});

async function listen(t, sendMail) {
  const server = createStakeholderServer({ sendMail });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}${acknowledgementPath}`;
}

const post = (url, data, origin = siteOrigin) => fetch(url, {
  method: 'POST',
  headers: { Origin: origin, 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

test('only valid, current, signed acknowledgements enter the mail queue', async t => {
  const sent = [];
  const endpoint = await listen(t, async data => { sent.push(data); });
  const data = fixture();
  const preflight = await fetch(endpoint, { method: 'OPTIONS', headers: { Origin: siteOrigin } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), siteOrigin);
  assert.equal((await post(endpoint, data, 'https://outside.example')).status, 403);
  assert.equal((await post(endpoint, { ...data, signature: 'Different signer' })).status, 422);
  assert.equal((await post(endpoint, { ...data, agreement_version: '0.1' })).status, 422);
  assert.equal((await post(endpoint, { ...data, accept_terms: '' })).status, 422);
  assert.equal((await post(endpoint, { ...data, capacity: 'Authorised representative' })).status, 422);
  assert.equal((await post(endpoint, { ...data, conflict: 'Relevant interest to disclose' })).status, 422);
  assert.equal((await post(endpoint, { ...data, intent: 'x'.repeat(20_000) })).status, 413);
  assert.equal(sent.length, 0);

  const receipts = await Promise.all([post(endpoint, data), post(endpoint, data)]);
  for (const receipt of receipts) {
    assert.equal(receipt.status, 202);
    assert.equal(receipt.headers.get('Cache-Control'), 'no-store');
    assert.deepEqual(await receipt.json(), { ok: true, reference: data.acknowledgement_reference });
  }
  assert.equal(sent.length, 1);
  assert.ok(Date.parse(sent[0].received_at_utc));
  assert.equal((await post(endpoint, { ...data, intent: 'A changed submission' })).status, 409);
});

test('a failed mail attempt can be retried with the original reference', async t => {
  let attempts = 0;
  const endpoint = await listen(t, async () => {
    attempts += 1;
    if (attempts === 1) throw new Error('Simulated mail outage');
  });
  const data = fixture();
  assert.equal((await post(endpoint, data)).status, 503);
  assert.equal((await post(endpoint, data)).status, 202);
  assert.equal(attempts, 2);
});

test('Graph sends to the project inbox and uses stakeholder email only for replies', async () => {
  const calls = [];
  const tenant = randomUUID();
  const data = fixture();
  const mailer = createGraphMailer({
    tenant,
    clientId: randomUUID(),
    clientSecret: 'synthetic-test-secret',
    sender: 'pilot@example.com',
    request: async (url, options) => {
      calls.push({ url, options });
      if (calls.length === 1) return Response.json({ access_token: 'synthetic-test-token' });
      return new Response(null, { status: 202 });
    },
  });

  await mailer({ ...data, recipient: 'ignored@example.com' });
  assert.equal(calls[0].url, `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`);
  assert.equal(calls[0].options.body.get('scope'), 'https://graph.microsoft.com/.default');
  assert.equal(calls[1].url, 'https://graph.microsoft.com/v1.0/users/pilot%40example.com/sendMail');
  const { message } = JSON.parse(calls[1].options.body);
  assert.deepEqual(message.toRecipients, [{ emailAddress: { address: contact } }]);
  assert.deepEqual(message.replyTo, [{ emailAddress: { address: data.email } }]);
  assert.equal(message.body.contentType, 'Text');
  assert.match(message.body.content, /Participation terms: Accepted/);
});
