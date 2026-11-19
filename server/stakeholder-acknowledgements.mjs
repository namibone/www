import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import {
  acknowledgementPath, comparableName, conflictOptions, declaredInterest,
  representative, version, versionDate,
} from '../assets/stakeholder-agreement-shared.js';
import { roles } from '../scripts/stakeholder-agreement.mjs';

const maxBodyBytes = 16_384;
const referencePattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const requiredText = {
  full_name: 140,
  email: 254,
  capacity: 40,
  role: 60,
  intent: 900,
  conflict: 40,
  accept_terms: 16,
  confirm_authority: 16,
  signature: 140,
  agreement_version: 16,
  agreement_date: 10,
  acknowledged_at_utc: 28,
  acknowledgement_reference: 36,
};
const pilotRoles = new Set([...roles.map(([role]) => role), 'Other']);

function boundedText(value, limit) {
  if (typeof value !== 'string' || value.length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) return '';
  return value.trim();
}

function validate(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || payload._gotcha) return null;
  const data = Object.fromEntries(Object.entries(requiredText).map(([key, limit]) => [key, boundedText(payload[key], limit)]));
  if (Object.values(data).some(value => !value)) return null;
  if (data.agreement_version !== version || data.agreement_date !== versionDate) return null;
  if (!referencePattern.test(data.acknowledgement_reference)) return null;
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(data.acknowledged_at_utc) || !Number.isFinite(Date.parse(data.acknowledged_at_utc))) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return null;
  if (!pilotRoles.has(data.role) || !conflictOptions.includes(data.conflict)) return null;
  if (data.accept_terms !== 'Accepted' || data.confirm_authority !== 'Confirmed') return null;
  if (comparableName(data.signature) !== comparableName(data.full_name)) return null;

  if (data.capacity === representative) {
    data.organisation = boundedText(payload.organisation, 160);
    if (!data.organisation) return null;
  } else if (data.capacity !== 'Individual') return null;

  if (data.conflict === declaredInterest) {
    data.interest_details = boundedText(payload.interest_details, 600);
    if (!data.interest_details) return null;
  }
  data.acknowledgement_reference = data.acknowledgement_reference.toLowerCase();
  return data;
}

async function readBody(request) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    bytes += chunk.length;
    if (bytes > maxBodyBytes) return null;
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export function createStakeholderServer({ sendMail, origin = 'https://namibone.com' }) {
  const attempts = new Map();
  const requests = [];
  const replayWindow = 15 * 60_000;
  const requestWindow = 60_000;

  return createServer({ requestTimeout: 20_000, headersTimeout: 10_000 }, async (request, response) => {
    const sameOrigin = request.headers.origin === origin;
    const cors = sameOrigin ? { 'Access-Control-Allow-Origin': origin } : {};
    const reply = (status, body, headers = {}) => response.writeHead(status, {
      ...cors,
      Vary: 'Origin',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    }).end(body ? JSON.stringify(body) : undefined);

    if (request.url !== acknowledgementPath) return reply(404, { ok: false });
    if (!sameOrigin) return reply(403, { ok: false });
    if (request.method === 'OPTIONS') return reply(204, null, {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '600',
    });
    if (request.method !== 'POST') return reply(405, { ok: false }, { Allow: 'POST, OPTIONS' });
    if (request.headers['content-type']?.split(';', 1)[0].trim().toLowerCase() !== 'application/json') {
      return reply(415, { ok: false });
    }
    if (Number(request.headers['content-length']) > maxBodyBytes) {
      return reply(413, { ok: false }, { Connection: 'close' });
    }

    let data;
    try {
      const body = await readBody(request);
      if (body === null) return reply(413, { ok: false }, { Connection: 'close' });
      data = validate(JSON.parse(body));
    } catch {
      if (!response.destroyed) reply(400, { ok: false });
      return;
    }
    if (!data) return reply(422, { ok: false });

    const now = Date.now();
    while (requests[0] <= now - requestWindow) requests.shift();
    for (const [key, attempt] of attempts) {
      if (attempt.time <= now - replayWindow) attempts.delete(key);
    }
    const reference = data.acknowledgement_reference;
    const fingerprint = createHash('sha256').update(JSON.stringify(data)).digest('hex');
    let attempt = attempts.get(reference);
    if (attempt && attempt.fingerprint !== fingerprint) return reply(409, { ok: false });
    if (!attempt) {
      if (requests.length >= 12) return reply(429, { ok: false }, { 'Retry-After': '60' });
      requests.push(now);
      const record = { ...data, received_at_utc: new Date(now).toISOString() };
      attempt = { time: now, fingerprint, pending: Promise.resolve().then(() => sendMail(record)) };
      attempts.set(reference, attempt);
    }

    try {
      await attempt.pending;
      if (!response.destroyed) reply(202, { ok: true, reference });
    } catch {
      if (attempts.get(reference) === attempt) attempts.delete(reference);
      if (!response.destroyed) reply(503, { ok: false });
    }
  });
}
