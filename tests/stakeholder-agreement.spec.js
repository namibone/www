import { expect, test } from '@playwright/test';
import { stakeholderAgreementPage } from '../scripts/stakeholder-agreement.mjs';
import { layout } from '../scripts/ui.mjs';
import { acknowledgementPath } from '../assets/stakeholder-agreement-shared.js';

const path = '/forms/index.html';
const name = 'Synthetic Pilot Tester';
const email = 'stakeholder@example.com';
const intent = 'Review the sample Companion and report accessibility findings.';

async function completeIdentityAndIntent(page) {
  const form = page.locator('#stakeholder-form');
  await form.getByLabel('Full name', { exact: true }).fill(name);
  await form.getByLabel('Contact email').fill(email);
  await form.getByLabel('Signing capacity').selectOption('Individual');
  await form.getByLabel('Pilot role').selectOption('Community or pilot participant');
  await form.getByLabel(/Statement of intent/).fill(intent);
  await form.getByLabel('Conflict of interest declaration').selectOption('None known');
  return form;
}

test('stakeholders review a signed email draft without a network submission', async ({ page }) => {
  const outbound = [];
  page.on('request', request => { if (request.method() === 'POST') outbound.push(request.url()); });
  await page.route(`**${path}`, route => route.fulfill({
    contentType: 'text/html',
    body: layout(stakeholderAgreementPage('')),
  }));
  await page.setViewportSize({ width: 390, height: 850 });
  await page.goto(path);
  await expect(page.getByRole('heading', { name: 'Stakeholder agreement', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const form = await completeIdentityAndIntent(page);
  await form.getByLabel('Signing capacity').selectOption('Authorised representative');
  await form.getByLabel('Organisation’s legal name').fill('Synthetic Pilot Organisation');
  await form.getByLabel('Conflict of interest declaration').selectOption('Relevant interest to disclose');
  await form.getByLabel('Relevant interest', { exact: true }).fill('Advises a prospective pilot supplier.');
  const submit = form.getByRole('button', { name: 'Prepare signed email' });
  const signature = form.getByLabel(/Type your full name to sign/);
  const draft = page.getByLabel('Email draft', { exact: true });
  await signature.fill(name);
  await submit.click();
  await expect(draft).toBeHidden();

  await form.getByRole('checkbox').nth(0).check();
  await form.getByRole('checkbox').nth(1).check();
  await signature.fill('Different name');
  await submit.click();
  await expect(signature).toBeFocused();
  await expect(draft).toBeHidden();

  await signature.fill(name);
  await submit.click();
  await expect(draft).toHaveValue(/Organisation: Synthetic Pilot Organisation/);
  const link = new URL(await page.getByRole('link', { name: 'Open email draft' }).getAttribute('href'));
  expect(link.pathname).toBe('raydo@skunkworks.africa');
  const message = link.searchParams.get('body');
  expect(message).toContain(`Typed signature: ${name}`);
  expect(message).toContain('Participation terms: Accepted');
  expect(message).toContain('Interest details: Advises a prospective pilot supplier.');
  expect(message).toMatch(/Agreement version: \d+\.\d+/);
  expect(message).toMatch(/Acknowledged at \(UTC\): \d{4}-\d{2}-\d{2}T/);
  expect(outbound).toEqual([]);

  await form.getByLabel('Conflict of interest declaration').selectOption('Request a private follow-up');
  await expect(draft).toBeHidden();
  await submit.click();
  await expect(draft).toHaveValue(/Conflict declaration: Request a private follow-up/);
  await expect(draft).not.toHaveValue(/Advises a prospective pilot supplier/);
});

test('enabled handler preserves retry details and confirms receipt', async ({ page }) => {
  const endpoint = `https://forms.example.test${acknowledgementPath}`;
  await page.route(`**${path}`, route => route.fulfill({
    contentType: 'text/html',
    body: layout(stakeholderAgreementPage(endpoint)),
  }));
  // Exercise the browser's status and retry logic independently of the HTTP
  // boundary. The Node test suite sends real requests to check that boundary.
  await page.addInitScript(url => {
    const originalFetch = window.fetch.bind(window);
    window.stakeholderTestRequests = [];
    window.fetch = async (request, options) => {
      if (request !== url) return originalFetch(request, options);
      const data = JSON.parse(options.body);
      window.stakeholderTestRequests.push({ method: options.method, data });
      const first = window.stakeholderTestRequests.length === 1;
      return new Response(JSON.stringify(first ? { ok: false } : {
        ok: true, reference: data.acknowledgement_reference,
      }), {
        status: first ? 503 : 202,
        headers: { 'Content-Type': 'application/json' },
      });
    };
  }, endpoint);
  await page.goto(path);
  const form = await completeIdentityAndIntent(page);
  await form.getByRole('checkbox').nth(0).check();
  await form.getByRole('checkbox').nth(1).check();
  await form.getByLabel(/Type your full name to sign/).fill(name);

  const submit = form.getByRole('button', { name: 'Sign and submit' });
  const status = form.getByRole('status');
  await submit.click();
  await expect(status).toContainText('could not confirm receipt');
  await expect(form.getByLabel('Contact email')).toHaveValue(email);
  await submit.click();
  await expect(status).toContainText('mail service accepted your acknowledgement');
  await expect(form.getByLabel('Contact email')).toHaveValue('');
  const requests = await page.evaluate(() => window.stakeholderTestRequests);
  expect(requests).toHaveLength(2);
  expect(requests[1]).toEqual(requests[0]);
  expect(requests[1]).toMatchObject({
    method: 'POST',
    data: {
      full_name: name,
      email,
      intent,
      accept_terms: 'Accepted',
      signature: name,
      acknowledgement_reference: expect.stringMatching(/^[0-9a-f-]{36}$/),
    },
  });
  expect(requests[1].data.organisation).toBeUndefined();
});
