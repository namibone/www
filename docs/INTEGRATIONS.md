# Live integration boundary

This release is a public, service-first prototype. It is not a government system of record, banking service, authenticated citizen portal or privileged staff portal. No official department affiliation, service endpoint, tariff, processing time or endorsement has been verified.

| Area | Working prototype | Required before live use |
| --- | --- | --- |
| Service catalogue | Eight sample journeys and six illustrative department groupings | Confirm official operators, names, mandates, eligibility, requirements, fees, SLAs and approved endpoints |
| Citizen applications | Preset request wizard, local status/detail and synthetic history | Identity verification, consent, secure backend, records ownership, validation, document handling, retention and deletion |
| Staff operations | Shared sample queue and local status changes | Verified staff tenant and RBAC, least privilege, audit trail, approval separation, secure session and backend enforcement |
| Communications | Sample inbox, preset local replies and notice previews | Verified sender/channel ownership, delivery provider, templates/consent, moderation, retention and audit; no outbound sending is present |
| Financial gateway | Fixed illustrative invoices, simulation, duplicate prevention, receipt/history | Approved payment provider and merchant, verified tariffs/payee, regulated controls, signed callbacks, server-side idempotency, reconciliation/refunds, fraud checks and accounting ownership |
| Companion | Responsive prompt UI, local service links, optional browser dictation, pauseable artwork | Approved server-side generative AI endpoint, provider credentials stored outside this repository, explicit data-handling controls and end-to-end validation; see COMPANION-INTEGRATION.md |
| Identity | Disabled Google/Microsoft/GitHub buttons; distinct public demo links | Follow `AUTHENTICATION.md`; complete real provider E2E tests and publish operator/privacy/support details |

On the NamibOne homepage, **Payments and finances** opens the sample payment area. **Open N1 Wallet preview** opens the separate dashboard at https://n1wallet.net/portal.html. Shared sign-in, balance synchronisation and real payment processing are future integrations.

The payment simulator never asks for a card, account number, OTP or payment credential. Its receipts prominently say they are demonstrations and not proof of payment. No downloadable bank/payment instructions are fabricated. The staff communication composer uses fixed sample templates and audiences; saving affects this tab only.

Public service guidance is available offline after saving. Workspaces and query URLs are excluded from the service worker cache. All future personal and financial API responses must be authenticated, authorised server-side, excluded from caches and served with appropriate no-store headers. GitHub Pages cannot enforce server-side authentication for these static prototype pages.

Before production claims: complete operator/partner verification, security threat modelling and testing, payment/identity provider approval, accessibility and usability testing with citizens/staff, public support/contact routes, monitoring, incident response and data-governance decisions. These are launch prerequisites, not claims already satisfied by this prototype.

## Stakeholder agreement

The acknowledgements at `/forms/index.html` are separate from the synthetic citizen and staff flows. The page records the stakeholder's contact details, declared role and interests, explicit acceptance, typed name, terms version, browser UTC timestamp and reference. It is excluded from the offline cache. The reference is reused if a submission is retried without editing the form. Check for the same reference before recording a duplicate.

The default mode prepares a draft addressed to `raydo@skunkworks.africa` for the stakeholder to review and send. Creating the draft makes no submission request. Acknowledgements received by email still need review for identity, authority and appointment.

For automatic delivery, create a dedicated Formspree form and verify `raydo@skunkworks.africa` as its Target Email. Copy the public ID from its `https://formspree.io/f/<id>` endpoint into `configuredFormId` in `scripts/stakeholder-agreement.mjs`. Keep account credentials outside the repository. Configure the form to accept the production domain and confirm the notification, access and retention settings with the project contact before collecting responses. After deployment, send a labelled synthetic acknowledgement from the production page and verify receipt in both the Formspree dashboard and the target mailbox.

Treat each terms release as a fixed version. Update the displayed and submitted version and date together when amending the agreement, and keep the corresponding release commit so the accepted wording can be recovered.
