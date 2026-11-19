# OneNam companion and service gateway

Live at **https://namibone.com**, hosted by GitHub Pages from this repository. Original history, custom domain and HTTPS are preserved.

The companion-first prototype contains **49 navigable pages**: a public service catalogue, eight service details, six department previews, public notices and guidance, citizen applications/messages/profile, department operations/casework/communications/analytics, and sample balances/payment review/history/receipts. The [stakeholder agreement](https://namibone.com/forms/index.html) covers pilot participation and includes a signed acknowledgement form.

All records, department groupings, requirements, metrics and fees are illustrative. There is no verified government affiliation. Citizen and staff workspaces are **public demonstrations, not authenticated or privileged portals**. Google, Microsoft and GitHub sign-in remain disabled. The sample workspaces do not submit real applications, messages, public announcements or payments.

## Companion-first landing

The root page opens on the supplied NamibOne Companion artwork. The desktop layout places a live prompt and six welcome bubbles over the scene. On mobile the prompt stays on the artwork and the bubbles become a two-column grid. The header menu includes services, workspaces and N1 Wallet, and mobile adds bottom navigation. Pause animation below the scene or use your device’s reduced-motion setting.

Typed prompts currently use an honest local **Service guide preview**, linking to existing journeys without transmitting the question. Live generative AI is **not connected**. `assets/companion.js` supports an explicitly configured same-origin `/api/` endpoint returning `{reply: string}`; GitHub Pages alone cannot run it. Messages remain in page memory, render as plain text and clear on reload or New conversation. Dictation requires an explicit click and may use the browser vendor’s speech service.

- [Mobile and desktop wireframes](docs/WIREFRAMES.md)
- [Live wireframe gallery](https://namibone.com/companion-wireframes.html)
- [Companion integration contract](docs/COMPANION-INTEGRATION.md)

## Run and check

```sh
npm ci
npx playwright install --with-deps chromium firefox webkit
npm run check
npm run dev
```

Requires Node.js 24. Preview: `http://127.0.0.1:4173`. The build writes only generated output to `dist/`. `scripts/pages.mjs` defines route content; `scripts/ui.mjs` supplies the shared shell and components. Browser interactions and synthetic records are in `assets/app.js` and `assets/data.js`.

The quality gate checks every page, all internal links, brand tokens, accessibility structure, sample/identity disclosures, the prototype and agreement size budgets, and the actual service worker's public/private boundary. Playwright tests all 49 routes and end-to-end sample workflows in Chromium, Firefox and WebKit. Screenshots are retained in CI artifacts. Main requires `Design and browser gate`, including administrators; the Pages deployment depends on that successful job. No legacy branch publisher bypasses the gate.

## Project status and development reports

The [project status page](https://namibone.com/status/index.html) shows the public NamibOne and N1 Wallet work register. Update the verification date, work records and evidence links together in `assets/project-status-data.js`. The site build generates the status page and its Markdown and PDF reports from that register. Use a confirmed deadline and owner when available. An empty field highlights an open assignment or scheduling gap.

## Try the journeys

1. Find a service and create a sample request using preset choices.
2. Open that request in the staff case queue and update its sample status.
3. Return to the citizen workspace to see the local change.
4. Read a sample message and save a preset local reply.
5. Simulate a sample payment, open its clearly labelled receipt and history.
6. Prepare a staff notice preview; save it locally without publishing or sending.
7. Reset changes on the sample profile page.

Sample state uses versioned session storage for the current browser tab only. The sample workspaces contain synthetic records and collect no personal details, documents or card details. See the [stakeholder agreement and email setup](docs/INTEGRATIONS.md#stakeholder-agreement) for the separate acknowledgement process. Search terms and companion conversations are not persisted. Public information and module dependencies are cached for offline reading; citizen, staff and financial pages are excluded from the service worker allowlist. Browser HTTP caches are separate. Without JavaScript, public links and guidance remain readable, including mobile navigation; prototype mutations require JavaScript.

- [Design and navigation system](docs/DESIGN-SYSTEM.md)
- [Authentication prerequisites](docs/AUTHENTICATION.md)
- [Live integration boundaries](docs/INTEGRATIONS.md)
- [Original artwork provenance](docs/ASSETS.md)
- [Overhaul review evidence](docs/OVERHAUL-REVIEW.md)

Only `dist/` is published. No secret belongs in this public repository. Sites hosting and unrelated OpenAI runtime integrations are not used; the authorised existing GitHub Pages hosting is retained.
