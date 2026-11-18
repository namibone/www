# NamibOne dialogue and African-language resource integration

## Architecture decision

Keep the existing static guided-intent router as a deterministic, offline-capable fallback. A server-side dialogue adapter may later use Rasa or another evaluated engine. The browser must not download or execute large language models, transmit questions to third parties without consent, or present unsupported languages as fully conversational.

## Candidate sources (evaluate before incorporation)

| Source | Purpose | Integration gate |
| --- | --- | --- |
| [Rasa Open Source](https://github.com/RasaHQ/rasa) | Server-side intent/entity and dialogue orchestration | Check current license, supported version, security maintenance and hosting costs. Use an authenticated API adapter; do not deploy Python services on GitHub Pages. |
| [Mozilla Common Voice](https://commonvoice.mozilla.org/) | Crowdsourced speech recordings | Confirm each language's actual corpus availability, release license, participant consent and quality. Do not assume Oshiwambo or Khoekhoegowab datasets exist. |
| [Masakhane](https://www.masakhane.io/) | African-language NLP community and research | Review individual model/dataset cards, consent, dialect coverage and license. Community name alone is not a production-ready language pack. |
| [NLLB](https://github.com/facebookresearch/fairseq/tree/nllb) | Research translation model family | Verify supported language codes, model terms and restrictions on commercial use before use. Never rely on machine translation alone for regulated guidance. |
| [CLDR](https://cldr.unicode.org/) and [ECMA-402 Intl](https://tc39.es/ecma402/) | Locale names, dates, plural rules, numeric formats | Test actual browser support; language selection does not change the currency or the user's country. |

## Implementation contract

The current browser-side `guideIntent(message,{locale})` returns `{intent,confidence,reply,links,mode}` without network access. The future same-origin API may return `{reply:string}` as already specified in `assets/companion.js`. For a production backend, add a versioned request contract including explicit `locale`, `mode`, a bounded message, optional short-lived context, and a response with reviewed sources, safe actions, and error/fallback metadata. Never let generated output authorize payments or change identity records.

## Rollout

1. Pilot English guided flows with unit and browser tests.
2. Obtain reviewed dictionaries, utterance samples and response templates for each Namibia-first locale.
3. Validate speech recognition and synthesis **per language and device**; do not claim that browser speech APIs support all Namibian languages.
4. Deploy backend dialogue adapter behind same-origin HTTPS with authentication, rate limiting, monitoring and redaction.
5. Evaluate generative AI and retrieval from verified service content separately, with deterministic fallback and explicit human escalation.

## Current status

No Rasa server, Common Voice corpus, Masakhane model or NLLB model has been downloaded, trained, licensed or deployed by this change. This document defines source evaluation and integration boundaries. The existing site remains a public prototype with no verified government affiliation or real financial services.
