export const version = '1.0';
export const versionDate = '2026-11-19';
export const contact = 'raydo@skunkworks.africa';
export const acknowledgementPath = '/api/stakeholder-acknowledgements';
export const representative = 'Authorised representative';
export const declaredInterest = 'Relevant interest to disclose';
export const conflictOptions = ['None known', declaredInterest, 'Request a private follow-up'];

export const fieldLabels = {
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
  received_at_utc: 'Received by handler (UTC)',
  acknowledgement_reference: 'Acknowledgement reference',
};

export function comparableName(name) {
  return name.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function acknowledgementText(data) {
  const details = Object.entries(fieldLabels)
    .filter(([key]) => data[key])
    .map(([key, label]) => `${label}: ${data[key]}`);
  return `NamibOne stakeholder acknowledgement\nhttps://namibone.com/forms/index.html\n\n${details.join('\n\n')}`;
}
