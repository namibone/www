import {
  statusPath, reportBase, publicStatusUrl, verifiedOn, states, stages, goals, work,
  decisions, sources, openWork, blockers, completedWork, missingOwners, missingDeadlines,
  displayDate, stageProgress, ownerLabel, deadlineLabel, reportSummary,
} from '../assets/project-status-data.js';

const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

const time = date => `<time datetime="${date}">${escape(displayDate(date))}</time>`;
const stateChip = state => `<span class="status-chip status-${state}">${states[state]}</span>`;
const link = (label, url) => `<a href="${escape(url)}">${escape(label)}</a>`;

const stageCards = stages.map(stage => {
  const progress = stageProgress(stage);
  return `<li class="status-stage panel">
    <div class="status-stage-head"><h3>${escape(stage.name)}</h3>${stateChip(progress.state)}</div>
    <p>${escape(stage.goal)}</p>
    <progress value="${progress.completed}" max="${progress.items.length}" aria-label="${escape(stage.name)} progress"></progress>
    <div class="status-stage-foot"><span>${progress.completed} of ${progress.items.length} complete</span><a href="#work-register" data-show-stage="${stage.id}" aria-label="View ${escape(stage.name)} work">View work</a></div>
  </li>`;
}).join('\n');

const workRows = work.map(item => {
  const stage = stages.find(entry => entry.id === item.stage);
  const needs = item.state !== 'completed' && (!item.owner || !item.deadline);
  return `<tr role="row" data-item-stage="${item.stage}" data-item-state="${item.state}" data-needs-assignment="${needs}">
    <th scope="row" role="rowheader"><strong>${escape(item.title)}</strong><span class="status-work-stage">${escape(stage.name)}</span><p>${escape(item.detail)}</p>${item.source ? link(item.source.label, item.source.url) : ''}</th>
    <td role="cell"><span class="status-mobile-label" aria-hidden="true">Status</span>${stateChip(item.state)}</td>
    <td role="cell"><span class="status-mobile-label" aria-hidden="true">Assignment</span>${escape(ownerLabel(item))}${item.suggestedOwner ? `<span class="status-field-note">Suggested role<br>${escape(item.suggestedOwner)}</span>` : ''}</td>
    <td role="cell"><span class="status-mobile-label" aria-hidden="true">Deadline</span>${escape(deadlineLabel(item))}${item.completedOn ? `<span class="status-field-note">Completed ${time(item.completedOn)}</span>` : ''}</td>
    <td role="cell" class="status-requirement"><span class="status-mobile-label" aria-hidden="true">Requirement</span>${escape(item.requirement)}</td>
  </tr>`;
}).join('\n');

const started = openWork.filter(item => ['active', 'review'].includes(item.state)).length;
const metrics = [
  [completedWork.length, 'Completed'], [started, 'In progress or review'],
  [blockers.length, 'Blocked'], [missingOwners.length, 'Open items without an owner'],
  [missingDeadlines.length, 'Open items without a deadline'],
];
const shareText = `${reportSummary()}\n\n${publicStatusUrl}#report`;
const emailHref = `mailto:?subject=${encodeURIComponent('NamibOne development report')}&body=${encodeURIComponent(`${shareText}\nPDF: https://namibone.com${reportBase}.pdf`)}`;
const whatsAppHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

export const projectStatusPage = {
  path: statusPath,
  title: 'Project status and stages',
  description: 'NamibOne and N1 Wallet delivery stages, milestones, requirements, owners, deadlines and shareable development reports.',
  offline: false,
  projectStatus: true,
  body: `
<div class="project-status">
  <header class="status-hero">
    <div>
      <p class="status-verified">Development snapshot · Verified ${time(verifiedOn)}</p>
      <h1>NamibOne project status</h1>
      <p>See what shipped across NamibOne and N1 Wallet, what is waiting for review and what needs a decision before the pilot.</p>
    </div>
    <a class="button secondary" href="#report">Development report</a>
  </header>

  <dl class="status-metrics" aria-label="Progress across ${work.length} tracked work items">
    ${metrics.map(([value, name]) => `<div class="panel"><dt>${escape(name)}</dt><dd>${value}</dd></div>`).join('')}
  </dl>

  <section aria-labelledby="stages-title">
    <div class="status-heading"><h2 id="stages-title">Delivery stages</h2><span>${completedWork.length} of ${work.length} tracked items completed</span></div>
    <ol class="status-stages">${stageCards}</ol>
  </section>

  <div class="status-overview">
    <section class="panel" aria-labelledby="goals-title">
      <h2 id="goals-title">Project goals</h2>
      <dl class="status-goals">${goals.map(([title, detail]) => `<div><dt>${escape(title)}</dt><dd>${escape(detail)}</dd></div>`).join('')}</dl>
    </section>
    <section class="panel status-attention" aria-labelledby="blockers-title">
      <h2 id="blockers-title">Current blockers</h2>
      <ul>${blockers.map(item => `<li><strong>${escape(item.title)}</strong><p>${escape(item.detail)}</p><p>${escape(item.requirement)}</p></li>`).join('')}</ul>
      <h3>Decisions needed</h3>
      <ul class="status-decisions">${decisions.map(decision => `<li>${escape(decision)}</li>`).join('')}</ul>
    </section>
  </div>

  <section class="panel status-register" id="work-register" aria-labelledby="register-title">
    <div class="status-heading"><h2 id="register-title">Work register</h2><span>Assignments and dates reflect published commitments.</span></div>
    <div class="status-filters" id="status-filters" hidden>
      <div class="field"><label for="stage-filter">Stage</label><select id="stage-filter"><option value="all">All stages</option>${stages.map(s => `<option value="${s.id}">${escape(s.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="work-status-filter">Status</label><select id="work-status-filter"><option value="all">All statuses</option>${Object.entries(states).map(([key, label]) => `<option value="${key}">${label}</option>`).join('')}</select></div>
      <label class="choice"><input type="checkbox" id="missing-assignment-filter"> Needs an owner or deadline</label>
    </div>
    <p id="status-item-count" class="status-result" role="status">${work.length} work items</p>
    <div class="status-table-wrap">
      <table class="status-table" role="table" aria-label="Project milestones, assignments, deadlines and requirements">
        <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Work item</th><th scope="col" role="columnheader">Status</th><th scope="col" role="columnheader">Assignment</th><th scope="col" role="columnheader">Deadline</th><th scope="col" role="columnheader">Requirement</th></tr></thead>
        <tbody role="rowgroup">${workRows}</tbody>
      </table>
    </div>
    <p class="status-empty" id="status-empty" hidden>No work items match these filters.</p>
  </section>

  <section class="panel status-report" id="report" aria-labelledby="report-title">
    <h2 id="report-title">Development report</h2>
    <p>The full report includes every stage, progress counts, blockers, assignments, deadlines, requirements and links to evidence. Data verified ${time(verifiedOn)}.</p>
    <div class="status-report-actions">
      <button class="button" type="button" id="generate-status-report" aria-expanded="false" aria-controls="status-report-preview" hidden>Generate report</button>
      <a class="button secondary" href="${reportBase}.md" download="namibone-development-report-${verifiedOn}.md">Download report</a>
      <a class="button secondary" href="${reportBase}.pdf" download="namibone-development-report-${verifiedOn}.pdf">Download PDF</a>
      <button class="button secondary" type="button" id="share-status-report" hidden>Share from this device</button>
      <a class="button secondary" href="${escape(emailHref)}">Share by email</a>
      <a class="button secondary" href="${escape(whatsAppHref)}" rel="noopener noreferrer" target="_blank">Share on WhatsApp</a>
    </div>
    <p id="report-feedback" class="status-result" role="status"></p>
    <p id="report-share-link" hidden>Report link <a href="${statusPath}#report">${publicStatusUrl}#report</a></p>
    <pre id="status-report-preview" aria-label="Development report preview" tabindex="0" hidden></pre>
  </section>

  <section class="status-sources" aria-labelledby="sources-title">
    <h2 id="sources-title">Verification sources</h2>
    <ul>${sources.map(([label, url]) => `<li>${link(label, url)}</li>`).join('')}</ul>
  </section>
</div>`,
};
