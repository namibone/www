const form = document.querySelector('#stakeholder-form');
const submitButton = form.querySelector('button[type="submit"]');
const sections = form.querySelectorAll('fieldset');
const status = document.querySelector('#agreement-status');
const draft = document.querySelector('#agreement-draft');
const { endpoint, contact } = form.dataset;
const fields = form.elements;
const subject = 'NamibOne stakeholder acknowledgement';
const labels = {
  full_name: 'Full name',
  email: 'Contact email',
  capacity: 'Signing capacity',
  organisation: 'Organisation',
  role: 'Pilot role',
  intent: 'Statement of intent',
  conflict: 'Conflict declaration',
  interest_details: 'Interest details',
  accept_terms: 'Participation terms',
  confirm_authority: 'Accuracy and signing authority',
  signature: 'Typed signature',
  agreement_version: 'Agreement version',
  agreement_date: 'Agreement version date',
  acknowledged_at_utc: 'Acknowledged at (UTC)',
  acknowledgement_reference: 'Acknowledgement reference',
};

function updateField(containerId, input, enabled) {
  document.getElementById(containerId).hidden = !enabled;
  input.disabled = !enabled;
  input.required = enabled;
  input.setCustomValidity('');
}

function updateConditionalFields() {
  updateField('organisation-field', fields.organisation, fields.capacity.value === 'Authorised representative');
  updateField('interest-field', fields.interest_details, fields.conflict.value === 'Relevant interest to disclose');
}

function comparableName(name) {
  return name.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}

function validResponse() {
  for (const input of [fields.full_name, fields.intent, fields.organisation, fields.interest_details]) {
    input.setCustomValidity(input.required && !input.value.trim() ? 'Enter a response for this field.' : '');
  }
  const matches = comparableName(fields.signature.value) === comparableName(fields.full_name.value);
  fields.signature.setCustomValidity(matches ? '' : 'Type the same full name you entered above.');
  return form.reportValidity();
}

function prepareDraft(data) {
  const details = Object.entries(labels)
    .filter(([key]) => data.get(key))
    .map(([key, label]) => `${label}: ${data.get(key)}`);
  const message = `${subject}\nhttps://namibone.com/forms/index.html\n\n${details.join('\n\n')}`;
  document.querySelector('#draft-message').value = message;
  document.querySelector('#open-agreement-email').href = `mailto:${contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message.replace(/\n/g, '\r\n'))}`;
  draft.hidden = false;
  status.textContent = 'Draft ready. Review the message and send it from your email app.';
}

async function submitToFormspree(data) {
  submitButton.disabled = true;
  for (const section of sections) section.disabled = true;
  form.setAttribute('aria-busy', 'true');
  status.textContent = 'Sending your acknowledgement…';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    data.set('_subject', subject);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data,
      credentials: 'omit',
      redirect: 'error',
      signal: controller.signal,
    });
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('The form service did not confirm receipt.');
    }
    const result = await response.json();
    if (!result.ok || result.errors?.length) throw new Error('The form service did not confirm receipt.');
    form.reset();
    updateConditionalFields();
    lastAttempt = undefined;
    status.textContent = `Your acknowledgement was received by the form service. Reference: ${data.get('acknowledgement_reference')}.`;
  } catch {
    status.textContent = `We could not confirm receipt. Your answers are still here. Try again or contact ${contact} with reference ${data.get('acknowledgement_reference')}.`;
  } finally {
    clearTimeout(timeout);
    form.removeAttribute('aria-busy');
    for (const section of sections) section.disabled = false;
    submitButton.disabled = false;
  }
}

let lastAttempt;
form.addEventListener('input', event => {
  event.target.setCustomValidity?.('');
  fields.signature.setCustomValidity('');
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

  const data = new FormData(form);
  for (const [key, value] of data) data.set(key, value.trim());
  lastAttempt ??= { time: new Date().toISOString(), reference: crypto.randomUUID() };
  data.set('acknowledged_at_utc', lastAttempt.time);
  data.set('acknowledgement_reference', lastAttempt.reference);

  if (endpoint) await submitToFormspree(data);
  else prepareDraft(data);
  status.focus();
});

updateConditionalFields();
submitButton.disabled = false;
