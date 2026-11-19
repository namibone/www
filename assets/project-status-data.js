export const statusPath = '/status/index.html';
export const reportBase = '/status/development-report';
export const publicStatusUrl = `https://namibone.com${statusPath}`;
export const verifiedOn = '2026-11-19';

export const states = {
  completed: 'Completed',
  active: 'In progress',
  review: 'In review',
  blocked: 'Blocked',
  planned: 'Planned',
};

export const stages = [
  { id: 'foundation', name: 'Foundation', goal: 'Publish the gateway, navigation and getting-started guides.' },
  { id: 'prototype', name: 'Pilot prototype', goal: 'Validate service, Companion, wallet and stakeholder journeys with sample data.' },
  { id: 'readiness', name: 'Pilot readiness', goal: 'Confirm owners, dates, secure processes and acceptance criteria.' },
  { id: 'pilot', name: 'Controlled pilot', goal: 'Run agreed tasks with pilot participants and resolve the findings.' },
  { id: 'production', name: 'Production readiness', goal: 'Approve the operating model, integrations and support before live use.' },
];

export const goals = [
  ['Public-service access', 'Help people in Namibia find service steps and learn how to use them.'],
  ['Language and accessibility', 'Prioritise Namibian languages, phone usability and low-bandwidth access.'],
  ['N1 Wallet', 'Test registration, QR codes and near-field communication (NFC) on supported devices with synthetic balances.'],
  ['Pilot governance', 'Agree who owns delivery, how feedback is handled and what qualifies the work for release.'],
];

export const work = [
  {
    id: 'gateway', stage: 'foundation', state: 'completed', title: 'Service gateway and offline reading',
    detail: 'The public gateway, service directory and offline reference content are published.',
    requirement: 'Keep essential guidance available on a phone and under poor connectivity.',
    milestone: true, owner: '@burnt-exe', completedOn: '2026-11-18',
    source: { label: 'Gateway release', url: 'https://github.com/namibone/www/pull/1' },
  },
  {
    id: 'navigation', stage: 'foundation', state: 'completed', title: 'Homepage and N1 Wallet navigation',
    detail: 'The Companion homepage and wallet entry points ship in the desktop and mobile navigation.',
    requirement: 'Find the Companion, services and N1 Wallet from the homepage.',
    completedOn: '2026-11-19',
    source: { label: 'Navigation release', url: 'https://github.com/namibone/www/pull/12' },
  },
  {
    id: 'guides', stage: 'foundation', state: 'completed', title: 'NamibOne Docs and quickstarts',
    detail: 'The published Docs cover citizen, staff, wallet and developer tasks with search and help.',
    requirement: 'Provide task-based onboarding and troubleshooting for the published preview.',
    milestone: true, completedOn: '2026-11-19',
    source: { label: 'NamibOne Docs', url: 'https://namibone.com/docs/' },
  },
  {
    id: 'workspaces', stage: 'prototype', state: 'completed', title: 'Citizen, staff and sample payment journeys',
    detail: 'Sample requests, staff case updates and simulation receipts are available in the public preview.',
    requirement: 'Complete the walkthrough using fictional services, records and amounts.',
    completedOn: '2026-11-18',
    source: { label: 'Pilot scope', url: 'https://namibone.com/docs/pilot/' },
  },
  {
    id: 'dictation', stage: 'prototype', state: 'completed', title: 'Companion dictation fix',
    detail: 'The deployed fix keeps the transcript editable after Stop and offers a keyboard fallback.',
    requirement: 'Preserve the transcript on Stop. Track the physical-device test under pilot readiness.',
    completedOn: '2026-11-19',
    source: { label: 'Dictation checks and release', url: 'https://github.com/namibone/www/actions/runs/44577926101' },
  },
  {
    id: 'wallet-preview', stage: 'prototype', state: 'completed', title: 'Responsive N1 Wallet preview',
    detail: 'The wallet homepage and dashboard reflow on phones and show sample balance, activity and action previews.',
    requirement: 'Make the demo balance, transactions and help reachable on narrow screens.',
    milestone: true, completedOn: '2026-11-19',
    source: { label: 'Wallet dashboard preview', url: 'https://n1wallet.net/portal.html' },
  },
  {
    id: 'agreement', stage: 'prototype', state: 'completed', title: 'Stakeholder agreement and signed email draft',
    detail: 'The agreement, scope, disclosures and typed acceptance are published with a manually sent email draft.',
    requirement: 'Record the accepted version, capacity, declaration and typed name.',
    milestone: true, completedOn: '2026-11-19',
    source: { label: 'Stakeholder agreement', url: 'https://namibone.com/forms/index.html' },
  },
  {
    id: 'languages', stage: 'prototype', state: 'review', title: 'Language selector and locale foundation',
    detail: 'The initial locale infrastructure is in an open pull request.',
    requirement: 'Update against main, confirm Namibia-first language priorities and assign language reviewers.',
    suggestedOwner: 'Localisation lead',
    source: { label: 'NamibOne PR #7', url: 'https://github.com/namibone/www/pull/7' },
  },
  {
    id: 'dialogue', stage: 'prototype', state: 'review', title: 'Guided Companion dialogue',
    detail: 'The expanded intent-based dialogue is in an open pull request stacked on the language foundation.',
    requirement: 'Review the language dependency and test supported intents, fallbacks and safe handoffs.',
    suggestedOwner: 'Companion engineering lead',
    source: { label: 'NamibOne PR #8', url: 'https://github.com/namibone/www/pull/8' },
  },
  {
    id: 'onboarding', stage: 'prototype', state: 'planned', title: 'Wallet registration and setup',
    detail: 'The public wallet preview currently starts with an illustrative account.',
    requirement: 'Demo registration, consent and first wallet setup with synthetic profiles.',
    suggestedOwner: 'Wallet product lead',
    source: { label: 'Wallet pilot scope', url: 'https://namibone.com/docs/pilot/' },
  },
  {
    id: 'qr', stage: 'prototype', state: 'planned', title: 'QR and scan-to-pay demo',
    detail: 'The wallet preview shows actions for sending, receiving and paying.',
    requirement: 'Generate a demo QR code, scan it, review payee and amount, and record a simulated payment.',
    suggestedOwner: 'Wallet engineering lead',
    source: { label: 'Wallet preview', url: 'https://n1wallet.net/portal.html' },
  },
  {
    id: 'nfc', stage: 'prototype', state: 'planned', title: 'NFC tap demonstration',
    detail: 'The proposed tap flow needs a device and platform feasibility check.',
    requirement: 'Confirm supported hardware and test a synthetic tap flow with a QR fallback.',
    suggestedOwner: 'Mobile engineering lead',
  },
  {
    id: 'agreement-email', stage: 'readiness', state: 'blocked', title: 'Automatic agreement delivery',
    detail: 'Automatic sending is waiting for an authorised delivery account. Stakeholders can use the email draft.',
    requirement: 'Choose a mail route, authorise the project sender and verify receipt of a synthetic submission.',
    suggestedOwner: 'Platform operations lead',
    source: { label: 'Agreement delivery setup', url: 'https://github.com/namibone/www/blob/main/docs/INTEGRATIONS.md#stakeholder-agreement' },
  },
  {
    id: 'pilot-schedule', stage: 'readiness', state: 'blocked', title: 'Pilot assignments and schedule',
    detail: 'The published delivery records have no pilot start date or named workstream owners for the open items.',
    requirement: 'Confirm the accountable sponsor, workstream owners, review dates and a pilot go/no-go meeting.',
    milestone: true, suggestedOwner: 'Pilot coordination lead',
  },
  {
    id: 'device-qa', stage: 'readiness', state: 'planned', title: 'Device, accessibility and language acceptance',
    detail: 'Browser checks are in place. Physical-device and reviewed-language results need to be recorded.',
    requirement: 'Test dictation and fallback on iPhone and Android, keyboard access, low bandwidth and priority language tasks.',
    suggestedOwner: 'Quality assurance lead',
    source: { label: 'Portal release checks', url: 'https://github.com/namibone/www/actions/runs/44609692960' },
  },
  {
    id: 'privacy-support', stage: 'readiness', state: 'planned', title: 'Pilot privacy, feedback and support',
    detail: 'The public preview uses synthetic records and gives users pilot guidance.',
    requirement: 'Agree the feedback route, data retention, access responsibilities and incident escalation before inviting participants.',
    suggestedOwner: 'Pilot privacy and support lead',
    source: { label: 'Pilot limitations', url: 'https://namibone.com/docs/pilot/' },
  },
  {
    id: 'pilot-run', stage: 'pilot', state: 'planned', title: 'Participant pilot and findings review',
    detail: 'The pilot session depends on readiness approval and a confirmed participant plan.',
    requirement: 'Run the agreed scenarios, measure completion and accessibility, triage findings and record the next release decision.',
    milestone: true, suggestedOwner: 'Pilot delivery lead',
  },
  {
    id: 'production-platform', stage: 'production', state: 'planned', title: 'Production portal and Companion integrations',
    detail: 'The public portal uses prototype service data and guided help.',
    requirement: 'Confirm service and sign-in approvals, production data controls, support and any generative Companion backend.',
    milestone: true, suggestedOwner: 'Platform product and security leads',
    source: { label: 'Production boundaries', url: 'https://github.com/namibone/www/blob/main/docs/INTEGRATIONS.md' },
  },
  {
    id: 'production-wallet', stage: 'production', state: 'planned', title: 'Live wallet operating approval',
    detail: 'N1 Wallet displays demo balances and activity.',
    requirement: 'Confirm the operating scope and required approvals, and validate ledger integrity, reconciliation, identity and support before live use.',
    milestone: true, suggestedOwner: 'Wallet operations and governance leads',
    source: { label: 'Wallet pilot guidance', url: 'https://namibone.com/docs/n1-wallet/' },
  },
];

export const decisions = [
  'Name the accountable pilot lead and publish workstream owners and review dates.',
  'Choose the automatic agreement delivery route and authorise the sending account.',
  'Agree the first Namibian languages, devices and participant journeys for acceptance testing.',
  'Approve the pilot success criteria and the boundary for any later use of real data or funds.',
];

export const sources = [
  ['NamibOne Pages release', 'https://github.com/namibone/www/actions/runs/44609692960'],
  ['N1 Wallet Pages release', 'https://github.com/namibone/wallet/actions/runs/44609543327'],
  ['NamibOne pull requests', 'https://github.com/namibone/www/pulls'],
  ['NamibOne Docs pilot scope', 'https://namibone.com/docs/pilot/'],
];

export const openWork = work.filter(item => item.state !== 'completed');
export const missingOwners = openWork.filter(item => !item.owner);
export const missingDeadlines = openWork.filter(item => !item.deadline);
export const blockers = work.filter(item => item.state === 'blocked');
export const completedWork = work.filter(item => item.state === 'completed');

export function displayDate(date) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${date}T00:00:00Z`));
}

export function stageProgress(stage) {
  const items = work.filter(item => item.stage === stage.id);
  const completed = items.filter(item => item.state === 'completed').length;
  const started = items.some(item => ['active', 'review'].includes(item.state));
  const blocked = items.some(item => item.state === 'blocked');
  let state = 'planned';
  if (completed || started) state = 'active';
  if (blocked && !started) state = 'blocked';
  if (completed === items.length) state = 'completed';
  return { items, completed, state };
}

export function ownerLabel(item) {
  return item.owner ?? (item.state === 'completed' ? 'No owner recorded' : 'Unassigned');
}

export function deadlineLabel(item) {
  if (item.deadline) return displayDate(item.deadline);
  return item.state === 'completed' ? 'No deadline recorded' : 'Date to set';
}

export function progressSummary() {
  return `${completedWork.length} of ${work.length} tracked items completed. ${blockers.length} blockers. ${missingOwners.length} open items need an owner and ${missingDeadlines.length} need a deadline.`;
}

export function reportSummary() {
  return `NamibOne development report | ${displayDate(verifiedOn)}\n${progressSummary()}`;
}

export function createDevelopmentReport() {
  const lines = [
    '# NamibOne development report', '',
    `Verified ${displayDate(verifiedOn)}. Progress counts the items in this register.`, '',
    progressSummary(), '',
    '## Project goals', '',
    ...goals.map(([title, description]) => `- **${title}**. ${description}`), '',
    '## Current blockers', '', ...blockers.map(item => `- **${item.title}**. ${item.detail} ${item.requirement}`), '',
    '## Decisions needed', '', ...decisions.map(decision => `- ${decision}`), '',
  ];
  for (const stage of stages) {
    const progress = stageProgress(stage);
    lines.push(`## ${stage.name}`, '', `${states[progress.state]}. ${progress.completed} of ${progress.items.length} complete. ${stage.goal}`, '');
    for (const item of progress.items) {
      lines.push(`### ${item.title}`, '', `**${item.milestone ? 'Milestone · ' : ''}${states[item.state]}**. ${item.detail}`, '',
        `- Owner: ${ownerLabel(item)}`,
        `- Deadline: ${deadlineLabel(item)}`);
      if (item.suggestedOwner) lines.push(`- Suggested role: ${item.suggestedOwner}`);
      if (item.completedOn) lines.push(`- Completed: ${displayDate(item.completedOn)}`);
      lines.push(`- Requirement: ${item.requirement}`);
      if (item.source) lines.push(`- Evidence: [${item.source.label}](${item.source.url})`);
      lines.push('');
    }
  }
  lines.push('## Sources', '', ...sources.map(([label, url]) => `- [${label}](${url})`), '', `[Open project status](${publicStatusUrl})`, '');
  return lines.join('\n');
}
