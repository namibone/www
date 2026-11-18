# OneNam companion landing: responsive wireframes

Prepared 18 November 2026 from the supplied NamibOne Companion reference. These are interface wireframes: the grey character silhouette marks where the supplied artwork belongs; it is not replacement production artwork.

## Deliverables

- `desktop.svg`: 1440 × 1000 annotated desktop composition with a 220 px navigation rail.
- `mobile.svg`: 440 × 1040 annotated composition containing a 390 × 844 mobile viewport.

The existing implementation uses **OneNam** at **namibone.com**. These wireframes retain that working identity and domain. The supplied reference is named NamibOne. No domain or organisation migration is implied.

## First arrival

Open `/` directly into the companion. The first useful action is a visible text composer labelled “Ask a question or tell me what you need”. A short greeting, optional voice button, send action and service shortcuts support it. Do not place a marketing page, sign-in wall or tutorial before this view.

On desktop, use a 220 px rail for Companion, Explore services, My space and Department workspace. A slim top bar carries language and profile controls. The content pairs a greeting and large composer on the left with the supplied companion character over a quiet Namibian landscape on the right. Put six service shortcuts beneath the composer. Existing service, citizen and department links must retain their existing routes and demonstration disclosures.

On mobile, use a compact brand/menu header, a shallow companion welcome region, the greeting, then the prominent composer. Keep six service shortcuts in a two-column grid and provide fixed bottom navigation for Companion, Services and My space. At 390 × 844, the prompt and send action must be visible without scrolling. On shorter screens, reduce the character region before reducing the composer. Account for `env(safe-area-inset-bottom)` and the on-screen keyboard; scroll the focused input into view if necessary. No hover-only controls.

## Conversation state

Submitting a prompt keeps the user on the same route and swaps the welcome composition for a conversation region. Retain access to the composer, existing navigation and a New conversation action. Render user text as text, not HTML. Loading, stop/cancel, unavailable, offline and error states must remain readable and actionable. Use a live region for complete response status without reading every streaming token.

No generative AI backend is configured in the existing public prototype. Therefore the shipped UI must not claim to be connected, invent model answers, show fake typing as if a live model is responding, or promise reliable voice/language support. A useful honest fallback is an explicitly labelled **service catalogue search** returning existing matching routes. If an approved live AI endpoint is later supplied, integrate it server-side; API keys must never enter this static repository or browser code.

## Character motion

Use the edited supplied character as an isolated asset over a low-detail landscape. Move only the artwork: small vertical drift, a subtle scale change, or an opacity-preserving settling movement. Keep all text, inputs and buttons stable. Either end the introductory motion within five seconds, or provide a permanently visible Pause motion control for any longer 8–12 second loop. Honour `prefers-reduced-motion: reduce` with a completely still character. Pausing must also stop decorative motion. Do not autoplay speech or request microphone permission on load.

CSS movement animates the artwork as a layer. It does not claim facial animation, lip synchronisation, live video or a conversational avatar service. Those require separately prepared frames/video and a verified runtime.

## Voice and language

Microphone access starts only after an explicit button press. Check browser support, show listening/stopped/error state and offer a clear stop control. Dictation fills the editable input; never submit automatically. Provide the typed path in every browser. Language selection must reflect implemented translations and voice capabilities. Do not reproduce the reference's unverified “11 official languages” claim.

## Validation

- Check desktop at 1440 px and mobile at 390 px plus a smaller 360 px viewport.
- Check landscape/short-height screens, keyboard focus order, visible labels, contrast and touch targets.
- Verify no overflow or content hidden behind fixed mobile navigation.
- Verify reduced-motion and Pause motion behaviour.
- Verify microphone denial/unsupported states without losing the prompt.
- Verify honest fallback behaviour without an AI endpoint and readable failure states.
- Preserve all existing service routes, public/private offline boundaries and quality gates.

The wireframes describe the desired layout and interaction contract. Production colours should draw from the provided reference: deep teal, warm cream and restrained desert tones, with clear text contrast. Never bake essential interface text or buttons into the artwork.
