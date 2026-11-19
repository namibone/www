import { acknowledgementText, comparableName, declaredInterest, representative } from './stakeholder-agreement-shared.js';

const form = document.querySelector('#stakeholder-form');
const submitButton = form.querySelector('button[type="submit"]');
const sections = form.querySelectorAll('fieldset');
const status = document.querySelector('#agreement-status');
const draft = document.querySelector('#agreement-draft');
const { endpoint, contact } = form.dataset;
const fields = form.elements;
const subject = 'NamibOne stakeholder acknowledgement';

function updateField(containerId, input, enabled) {
  document.getElementById(containerId).hidden = !enabled;
  input.disabled = !enabled;
  input.required = enabled;
  if (!enabled) input.removeAttribute('aria-invalid');
}

function updateConditionalFields() {
  updateField('organisation-field', fields.organisation, fields.capacity.value === representative);
  updateField('interest-field', fields.interest_details, fields.conflict.value === declaredInterest);
}

function markInvalid(input, message) {
  input.setAttribute('aria-invalid', 'true');
  status.textContent = message;
  input.focus();
}

function validResponse() {
  const blank = [fields.full_name, fields.intent, fields.organisation, fields.interest_details]
    .find(input => input.required && !input.value.trim());
  if (blank) {
    markInvalid(blank, 'Enter a response in the highlighted field.');
    return false;
  }
  if (comparableName(fields.signature.value) !== comparableName(fields.full_name.value)) {
    markInvalid(fields.signature, 'Type the same full name you entered above.');
    return false;
  }
  return true;
}

function prepareDraft(data) {
  const message = acknowledgementText(data);
  document.querySelector('#draft-message').value = message;
  document.querySelector('#open-agreement-email').href = `mailto:${contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message.replace(/\n/g, '\r\n'))}`;
  draft.hidden = false;
  status.textContent = 'Draft ready. Review the message and send it from your email app.';
}

async function sendAcknowledgement(data) {
  submitButton.disabled = true;
  for (const section of sections) section.disabled = true;
  form.setAttribute('aria-busy', 'true');
  status.textContent = 'Sending your acknowledgement…';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  const reference = data.acknowledgement_reference;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'omit',
      redirect: 'error',
      signal: controller.signal,
    });
    const result = await response.json();
    if (!response.ok || !result.ok || result.reference !== reference) {
      throw new Error('The handler did not confirm receipt.');
    }
    form.reset();
    updateConditionalFields();
    lastAttempt = undefined;
    status.textContent = `The mail service accepted your acknowledgement. Your receipt reference is ${reference}.`;
  } catch {
    status.textContent = `We could not confirm receipt. Your answers are still here. Try again or contact ${contact} with reference ${reference}.`;
  } finally {
    clearTimeout(timeout);
    form.removeAttribute('aria-busy');
    for (const section of sections) section.disabled = false;
    submitButton.disabled = false;
  }
}

let lastAttempt;
form.addEventListener('input', event => {
  event.target.removeAttribute('aria-invalid');
  if (event.target === fields.full_name) fields.signature.removeAttribute('aria-invalid');
  updateConditionalFields();
  lastAttempt = undefined;
  if (draft && !draft.hidden) {
    draft.hidden = true;
    document.querySelector('#draft-message').value = '';
    document.querySelector('#open-agreement-email').href = `mailto:${contact}`;
    status.textContent = 'Prepare a new draft to include your changes.';
  }
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (submitButton.disabled || !validResponse() || fields._gotcha.value) return;

  const data = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, value.trim()]));
  lastAttempt ??= { time: new Date().toISOString(), reference: crypto.randomUUID() };
  data.acknowledged_at_utc = lastAttempt.time;
  data.acknowledgement_reference = lastAttempt.reference;

  if (endpoint) await sendAcknowledgement(data);
  else prepareDraft(data);
  status.focus();
});

updateConditionalFields();
submitButton.disabled = false;
