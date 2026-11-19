import { expect, test } from '@playwright/test';
import {
  blockers, createDevelopmentReport, openWork, publicStatusUrl, reportBase,
  statusPath, work,
} from '../assets/project-status-data.js';

test('the mobile work register filters stages, blockers and assignment gaps', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(statusPath);
  await expect(page.getByRole('heading', { name: 'NamibOne project status' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const rows = page.locator('[data-item-stage]:visible');
  await expect(rows).toHaveCount(work.length);
  await page.getByLabel('Milestones only').check();
  await expect(rows).toHaveCount(work.filter(item => item.milestone).length);

  await page.getByRole('link', { name: 'View Pilot readiness work' }).click();
  await expect(page.getByLabel('Stage', { exact: true })).toHaveValue('readiness');
  await page.getByLabel('Status', { exact: true }).selectOption('blocked');
  await expect(rows).toHaveCount(blockers.filter(item => item.stage === 'readiness').length);
  await expect(rows.filter({ hasText: 'Automatic agreement delivery' })).toBeVisible();

  await page.getByLabel('Stage', { exact: true }).selectOption('all');
  await page.getByLabel('Status', { exact: true }).selectOption('all');
  await page.getByLabel('Needs an owner or deadline').check();
  await expect(rows).toHaveCount(openWork.filter(item => !item.owner || !item.deadline).length);
  await page.getByLabel('Stage', { exact: true }).selectOption('foundation');
  await expect(page.getByText('No work items match these filters.')).toBeVisible();
});

test('the report preview, downloads and share links use the same snapshot', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { value: () => true });
    Object.defineProperty(navigator, 'share', { value: async data => { window.sharedReport = data; } });
  });
  await page.goto(statusPath);
  await page.getByRole('button', { name: 'Generate report' }).click();
  const preview = page.locator('#status-report-preview');
  await expect(preview).toBeVisible();
  expect(await preview.textContent()).toBe(createDevelopmentReport());

  const textDownload = page.getByRole('link', { name: 'Download report', exact: true });
  const pdfDownload = page.getByRole('link', { name: 'Download PDF', exact: true });
  await expect(textDownload).toHaveAttribute('download', /\.md$/);
  await expect(pdfDownload).toHaveAttribute('download', /\.pdf$/);
  const textResponse = await page.request.get(`${reportBase}.md`);
  expect(textResponse.ok()).toBe(true);
  expect(await textResponse.text()).toBe(createDevelopmentReport());
  const pdfResponse = await page.request.get(`${reportBase}.pdf`);
  expect(pdfResponse.ok()).toBe(true);
  expect(pdfResponse.headers()['content-type']).toContain('application/pdf');
  expect((await pdfResponse.body()).subarray(0, 5).toString()).toBe('%PDF-');

  await page.getByRole('button', { name: 'Share from this device' }).click();
  expect(await page.evaluate(() => window.sharedReport)).toMatchObject({
    title: 'NamibOne development report', url: `${publicStatusUrl}#report`,
  });
  const email = new URL(await page.getByRole('link', { name: 'Share by email' }).getAttribute('href'));
  expect(email.pathname).toBe('');
  expect(email.searchParams.get('body')).toContain(`${reportBase}.pdf`);
  const whatsapp = new URL(await page.getByRole('link', { name: 'Share on WhatsApp' }).getAttribute('href'));
  expect(whatsapp.hostname).toBe('wa.me');
  expect(whatsapp.searchParams.get('text')).toContain(`${publicStatusUrl}#report`);
});

test('the report exposes its link when native sharing and clipboard are unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('Clipboard unavailable'); } } });
  });
  await page.goto(statusPath);
  await page.getByRole('button', { name: 'Copy report link' }).click();
  await expect(page.locator('#report-share-link')).toContainText(`${publicStatusUrl}#report`);
});
