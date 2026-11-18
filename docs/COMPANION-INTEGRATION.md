# Companion integration contract

## Shipped mode

The landing experience is a functional **local service guide preview**. It routes questions to the existing catalogue, sample application tracker and payment preview. Replies disclose that they are catalogue guidance, not generated model answers. No typed question leaves the page in this mode. This distinction is deliberate: there is no live generative AI backend in this repository or deployment.

The user-authorized first screen is implemented at `/`. The existing `onenam.africa` CNAME, OneNam identity, GitHub Pages deployment and service routes remain authoritative. The spoken `.com` name has not been treated as authorization to replace the configured domain.

## Optional AI endpoint

`assets/companion.js` reads `data-companion-endpoint` from the `[data-companion]` root. It is absent in the released HTML. A future verified integration must provide a same-origin path under `/api/` (for example `/api/companion`); external origins, URL credentials, query strings and fragments are rejected. Never insert a provider API key into HTML, JavaScript, the build output or GitHub.

Request after explicit Send:

```json
{"message":"The current question","history":[{"role":"user","content":"Previous question"},{"role":"assistant","content":"Previous answer"}]}
```

Successful response:

```json
{"reply":"Plain text generated answer"}
```

The browser sends JSON using POST with `credentials: same-origin`, `cache: no-store` and a 20-second timeout. Responses must contain a nonempty reply of at most 20,000 characters and are rendered as text, never HTML. The composer accepts 1,000 characters. At most ten previous message entries are included in the request; the page allows thirty questions before New conversation is required. New conversation aborts pending work and prevents late responses from repopulating the cleared view. Offline/error states keep local service links available. Browser requests and model output must never be allowed to authorize official actions or financial transactions.

GitHub Pages serves static files and cannot execute this API. A future backend such as Azure Functions needs an explicitly configured same-origin route at the domain's edge, or an intentional separately reviewed transport/CSP change. The hosting, provider deployment and secret configuration are not present, and no Azure resource or model subscription has been provisioned by this change.

Before enabling the attribute, verify the actual backend's authentication or anonymous rate limits, input bounds, output bounds, prompt-injection handling, safe tool boundaries, origin/CSRF handling, no-store responses, privacy/retention policy, error contract and provider cost controls. These are requirements for that backend, not claims about an implementation already deployed.

## Voice and privacy

Browser dictation is available only when SpeechRecognition or webkitSpeechRecognition exists. It starts on click, shows listening/error/stopped state, stops on leaving the page, and fills the editable input without sending. Browser speech processing may use the browser vendor's service. It is English (`en-ZA`) in this release. No recording or voice data is stored by this application. Unsupported browsers retain the typed interface with a clearly labelled unavailable microphone button.

Typed conversation history is held only in memory and clears on reload or New conversation. It does not enter session/local storage, service-worker caches, query strings or analytics. Preset citizen/staff sample state uses the existing separate tab-local storage path. No live identity, banking or government integration is introduced.

## Verification

The design gate allows exactly one bounded textarea on the home route and preserves the existing 650,000-byte HTML/assets budget. Focused browser cases cover local routing, no prompt transmission/persistence, injection-safe rendering, explicit send, cancellation, error handling, optional endpoint validation, reduced motion, dictation consent and mobile composer placement. Existing route, accessibility, sample-workflow and offline-boundary tests remain in place.
