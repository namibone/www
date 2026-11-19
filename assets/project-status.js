import { createDevelopmentReport, reportSummary, publicStatusUrl } from './project-status-data.js';

const filters = document.querySelector('#status-filters');
const stage = document.querySelector('#stage-filter');
const state = document.querySelector('#work-status-filter');
const missing = document.querySelector('#missing-assignment-filter');
const milestone = document.querySelector('#milestone-filter');
const rows = [...document.querySelectorAll('[data-item-stage]')];
const count = document.querySelector('#status-item-count');
const empty = document.querySelector('#status-empty');

function applyFilters() {
  const visible = rows.filter(row => {
    const matchesStage = stage.value === 'all' || row.dataset.itemStage === stage.value;
    const matchesState = state.value === 'all' || row.dataset.itemState === state.value;
    const matchesAssignment = !missing.checked || row.dataset.needsAssignment === 'true';
    const matchesMilestone = !milestone.checked || row.hasAttribute('data-milestone');
    row.hidden = !(matchesStage && matchesState && matchesAssignment && matchesMilestone);
    return !row.hidden;
  }).length;
  count.textContent = `Showing ${visible} of ${rows.length} work items`;
  empty.hidden = visible > 0;
}

filters.hidden = false;
filters.addEventListener('change', applyFilters);
for (const link of document.querySelectorAll('[data-show-stage]')) {
  link.addEventListener('click', () => {
    stage.value = link.dataset.showStage;
    state.value = 'all';
    missing.checked = false;
    milestone.checked = false;
    applyFilters();
  });
}

const generate = document.querySelector('#generate-status-report');
const preview = document.querySelector('#status-report-preview');
const share = document.querySelector('#share-status-report');
const feedback = document.querySelector('#report-feedback');
const shareLink = document.querySelector('#report-share-link');
const shareUrl = `${publicStatusUrl}#report`;

generate.hidden = false;
generate.addEventListener('click', () => {
  const show = preview.hidden;
  if (show) preview.textContent = createDevelopmentReport();
  preview.hidden = !show;
  generate.setAttribute('aria-expanded', String(show));
  generate.textContent = show ? 'Hide report preview' : 'Generate report';
  feedback.textContent = show ? 'Development report ready to preview or share.' : '';
});

async function shareOrCopy() {
  const payload = { title: 'NamibOne development report', text: reportSummary(), url: shareUrl };
  if (typeof navigator.share === 'function') {
    try {
      if (!navigator.canShare || navigator.canShare(payload)) {
        await navigator.share(payload);
        return;
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(shareUrl);
    feedback.textContent = 'Development report link copied.';
  } catch {
    shareLink.hidden = false;
    feedback.textContent = 'Use the report link below to share it.';
  }
}

share.hidden = false;
if (typeof navigator.share !== 'function') share.textContent = 'Copy report link';
share.addEventListener('click', shareOrCopy);
