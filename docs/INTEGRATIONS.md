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

The payment simulator never asks for a card, account number, OTP or payment credential. Its receipts prominently say they are demonstrations and not proof of payment. No downloadable bank/payment instructions are fabricated. The staff communication composer uses fixed sample templates and audiences; saving affects this tab only.

Public service guidance is available offline after saving. Workspaces and query URLs are excluded from the service worker cache. All future personal and financial API responses must be authenticated, authorised server-side, excluded from caches and served with appropriate no-store headers. GitHub Pages cannot enforce server-side authentication for these static prototype pages.

Before production claims: complete operator/partner verification, security threat modelling and testing, payment/identity provider approval, accessibility and usability testing with citizens/staff, public support/contact routes, monitoring, incident response and data-governance decisions. These are launch prerequisites, not claims already satisfied by this prototype.
