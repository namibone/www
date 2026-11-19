const version = '1.0';
const versionDate = '2026-11-19';
const contact = 'raydo@skunkworks.africa';

// Set this to the public Formspree form ID after its Target Email is verified.
const configuredFormId = '';

const roles = [
  ['Project coordination', 'Maintain the pilot scope, decision log, risk register and review schedule. Confirm assignments and escalate decisions to the authorised parties.'],
  ['Sponsor or steering representative', 'Review priorities and risks, help resolve dependencies and obtain any approvals from your own organisation.'],
  ['Technical delivery or security', 'Build and test assigned prototype features with synthetic data. Document limitations, protect access and report incidents.'],
  ['Service, content or language partner', 'Check service information, language and accessibility with the relevant reviewers. Record evidence and permissions for contributed material.'],
  ['Community or pilot participant', 'Try agreed sample journeys, give feedback and raise barriers or accessibility issues through the project contact.'],
  ['Adviser or prospective delivery partner', 'Offer advice within your remit and disclose interests, dependencies and any approvals your organisation requires.'],
];

export function stakeholderAgreementPage(formId = configuredFormId) {
  if (formId && !/^[a-z0-9_-]{5,64}$/i.test(formId)) {
    throw new Error('The stakeholder Formspree ID must be the ID from the verified form endpoint.');
  }
  const endpoint = formId ? `https://formspree.io/f/${formId}` : '';
  const delivery = endpoint
    ? `When you submit, Formspree processes and stores your response and emails it to ${contact}. Formspree and the email service may process it outside your country. See <a href="https://formspree.io/legal/privacy-policy/">Formspree’s privacy policy</a>.`
    : `Automatic delivery is pending. This page prepares a draft for you to review and send from your email app to ${contact}. Preparing the draft keeps your answers on this page.`;

  return {
    path: '/forms/index.html',
    title: 'Stakeholder agreement',
    description: 'Review the NamibOne pilot memorandum of understanding, scope, duties and participation terms. Declare your intent and record your acceptance.',
    offline: false,
    stakeholderAgreement: true,
    formspreeEnabled: Boolean(endpoint),
    body: `
<div class="agreement">
  <header class="agreement-hero">
    <div>
      <p class="agreement-version">Namibia pilot · Version ${version} · <time datetime="${versionDate}">19 November 2026</time></p>
      <h1>Stakeholder agreement</h1>
      <p>Review the memorandum of understanding, scope, duties and terms. Then declare your intent and acknowledge the terms in your own capacity or as an authorised representative.</p>
    </div>
    <img src="/assets/namib-coast.webp" alt="" width="960" height="640">
  </header>
  <nav class="agreement-nav" aria-label="Agreement sections">
    <a href="#memorandum">Memorandum</a>
    <a href="#scope">Scope</a>
    <a href="#duties">Duties</a>
    <a href="#terms">Terms</a>
    <a href="#acceptance">Acknowledgement</a>
  </nav>

  <article class="panel prose agreement-document" aria-label="NamibOne pilot agreement, version ${version}">
    <section id="memorandum" aria-labelledby="memorandum-title">
      <h2 id="memorandum-title">1. Memorandum of understanding</h2>
      <p>The NamibOne project team and participating stakeholders intend to evaluate an independent digital service prototype for Namibia. The project contact is Raydo Matthee at Skunkworks (Pty) Ltd.</p>
      <p>Stakeholders indicate who they represent, what they can contribute and any conditions on their involvement. The project team confirms participation, work owners and decision authority in writing. The participation terms in section 4 apply to any pilot access or work undertaken after acceptance.</p>
      <p>Each organisation obtains its own approvals. Funding, procurement, joint ownership, employment and agency require separate written agreements. Only an authorised representative may make commitments for an organisation.</p>
    </section>

    <section id="scope" aria-labelledby="scope-title">
      <h2 id="scope-title">2. Project scope</h2>
      <p>The Namibia pilot explores service discovery, public guidance, education and work opportunities; the NamibOne Companion’s guided dialogue; accessibility and Namibian-language validation; and sample citizen, staff and N1 Wallet journeys.</p>
      <p>Pilot work covers discovery, prototype design, testing with synthetic data, stakeholder feedback and a readiness decision. Track deliverables, milestones, dependencies and acceptance criteria in a written work plan approved by the responsible parties.</p>
      <p>Live government applications, identity verification, sensitive records, real wallet accounts, payments and production integrations are outside this scope. Each requires an approved scope change, a responsible operator and the relevant approvals before any live use.</p>
    </section>

    <section id="duties" aria-labelledby="duties-title">
      <h2 id="duties-title">3. Stakeholder duties</h2>
      <p>Choose the role closest to your intended contribution. Confirm named responsibilities and deadlines with the project team before starting work.</p>
      <dl class="agreement-duties">
        ${roles.map(([role, duty]) => `<div><dt>${role}</dt><dd>${duty}</dd></div>`).join('\n        ')}
      </dl>
    </section>

    <section id="terms" aria-labelledby="terms-title">
      <h2 id="terms-title">4. Participation terms and conditions</h2>
      <ol class="agreement-terms">
        <li><strong>Confidentiality.</strong> Use non-public project information only for approved pilot work and share it only with authorised people who need it. This duty continues while the information remains confidential. Where disclosure is required by law, give the project contact notice if permitted.</li>
        <li><strong>Data and access.</strong> Use only authorised systems and synthetic pilot records. Protect credentials, limit access to assigned duties and report loss, misuse or a suspected incident promptly to the project contact. Keep citizen identifiers, health records, banking details and credentials out of the pilot and this form.</li>
        <li><strong>Interests and conduct.</strong> Declare actual, potential or perceived conflicts that could influence your role or a project decision. Update your declaration if circumstances change. Pause involvement in an affected decision until the conflict is addressed. Ask for private follow-up when details are sensitive.</li>
        <li><strong>Intellectual property.</strong> Each contributor retains its existing materials. Share only material you are authorised to provide. The project team may review permitted contributions for pilot evaluation. Agree ownership and licence terms for new deliverables in writing before reusing or releasing them.</li>
        <li><strong>Public statements and expenses.</strong> Obtain written authorisation before making public statements for the project, using another party’s name or branding, or claiming government or regulatory endorsement. Each party bears its own costs unless an authorised agreement provides otherwise.</li>
        <li><strong>Changes and withdrawal.</strong> Obtain written approval before changing scope or commitments. Material changes to these terms require fresh acceptance. You may withdraw by written notice. On exit, stop using project access and return or delete restricted material as directed, subject to any lawful retention obligations.</li>
        <li><strong>Issues and disputes.</strong> Raise issues with the project contact. The responsible representatives will seek to resolve them in good faith and escalate where appropriate under any applicable signed agreement and law. Mandatory rights and obligations continue to apply.</li>
      </ol>
    </section>
  </article>

  <section class="panel agreement-acceptance" id="acceptance" aria-labelledby="acceptance-title">
    <h2 id="acceptance-title">Stakeholder acknowledgement</h2>
    <p class="muted">Complete the required fields before signing. One acknowledgement is needed for each participant or authorised representative.</p>
    <div class="agreement-notice" id="acknowledgement-privacy">
      <h3>How your response is handled</h3>
      <p>The project contact at Skunkworks (Pty) Ltd uses your name, email, role, statement and signature to review your participation and keep a record of the version you accepted. Access is limited to those reviewing or administering your participation. Records are retained as needed for that purpose and applicable obligations. You can decline to submit. Pilot participation requires a completed acknowledgement.</p>
      <p>${delivery} For access, correction, deletion or questions about your response, email <a href="mailto:${contact}">${contact}</a>.</p>
    </div>
    <form id="stakeholder-form" method="post" data-endpoint="${endpoint}" data-contact="${contact}" aria-describedby="acknowledgement-privacy">
      <input type="hidden" name="agreement_version" value="${version}">
      <input type="hidden" name="agreement_date" value="${versionDate}">
      <div hidden><input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></div>

      <fieldset>
        <legend>Your identity and role</legend>
        <div class="agreement-fields">
          <label class="field">Full name <input name="full_name" autocomplete="name" maxlength="140" required></label>
          <label class="field">Contact email <input name="email" type="email" autocomplete="email" maxlength="254" required></label>
          <label class="field">Signing capacity
            <select name="capacity" required>
              <option value="">Select your capacity</option>
              <option value="Individual">Individual</option>
              <option value="Authorised representative">Authorised representative</option>
            </select>
          </label>
          <label class="field" id="organisation-field" hidden>Organisation’s legal name <input name="organisation" autocomplete="organization" maxlength="160" disabled></label>
          <label class="field">Pilot role
            <select name="role" required>
              <option value="">Select your role</option>
              ${roles.map(([role]) => `<option>${role}</option>`).join('\n              ')}
              <option>Other</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Intent and interests</legend>
        <div class="agreement-fields">
          <label class="field agreement-wide">Statement of intent
            <span class="small muted">Describe what you intend to contribute, including any responsibilities or conditions you want the team to confirm.</span>
            <textarea name="intent" rows="4" maxlength="900" required></textarea>
          </label>
          <label class="field agreement-wide">Conflict of interest declaration
            <select name="conflict" required>
              <option value="">Select a declaration</option>
              <option>None known</option>
              <option>Relevant interest to disclose</option>
              <option>Request a private follow-up</option>
            </select>
          </label>
          <label class="field agreement-wide" id="interest-field" hidden>Relevant interest
            <span class="small muted">Share only the nature of the interest and its effect on your role. Use the private follow-up option for sensitive details.</span>
            <textarea name="interest_details" rows="3" maxlength="600" disabled></textarea>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Accept the terms</legend>
        <div class="agreement-checks">
          <label class="choice"><input type="checkbox" name="accept_terms" value="Accepted" required> <span>I have read the memorandum of understanding, scope and duties. I agree to the participation terms in version ${version}.</span></label>
          <label class="choice"><input type="checkbox" name="confirm_authority" value="Confirmed" required> <span>My details and disclosure are accurate to the best of my knowledge. If I am signing for an organisation, I am authorised to accept these terms on its behalf.</span></label>
        </div>
        <label class="field agreement-signature">Type your full name to sign
          <span class="small muted">Use the same name you entered above. The typed name records your agreement in the capacity you selected.</span>
          <input name="signature" maxlength="140" autocomplete="off" required>
        </label>
      </fieldset>

      <button class="button" type="submit" disabled>${endpoint ? 'Sign and submit' : 'Prepare signed email'}</button>
      <p class="status-region agreement-status" role="status" id="agreement-status" tabindex="-1"></p>
    </form>
    ${endpoint ? '' : `<section class="agreement-notice agreement-draft" id="agreement-draft" aria-labelledby="draft-title" hidden>
      <h3 id="draft-title">Review and send your acknowledgement</h3>
      <p>Open your email app to send the signed draft. If your email app leaves the body blank, copy the text below into the message.</p>
      <label class="field">Email draft <textarea id="draft-message" rows="8" readonly></textarea></label>
      <a class="button" id="open-agreement-email" href="mailto:${contact}">Open email draft</a>
    </section>`}
  </section>
</div>`,
  };
}
