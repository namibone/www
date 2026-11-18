# OneNam service gateway prototype

Live at **https://onenam.africa**, hosted by GitHub Pages from this repository. Original history, custom domain and HTTPS are preserved.

The service-first prototype contains **46 navigable pages**: a public service catalogue, eight service details, six department previews, public notices and guidance, citizen applications/messages/profile, department operations/casework/communications/analytics, and sample balances/payment review/history/receipts.

All records, department groupings, requirements, metrics and fees are illustrative. There is no verified government affiliation. Citizen and staff workspaces are **public demonstrations, not authenticated or privileged portals**. Google, Microsoft and GitHub sign-in remain disabled. No real application, message, public announcement or payment is submitted.

## Run and check

```sh
npm ci
npx playwright install --with-deps chromium firefox webkit
npm run check
npm run dev
```

Requires Node.js 24. Preview: `http://127.0.0.1:4173`. The build writes only generated output to `dist/`. `scripts/pages.mjs` defines route content; `scripts/ui.mjs` supplies the shared shell and components. Browser interactions and synthetic records are in `assets/app.js` and `assets/data.js`.

The quality gate checks every page, all internal links, brand tokens, accessibility structure, sample/identity disclosures, a 650 KB total HTML/assets budget, and the actual service worker's public/private boundary. Playwright tests all 46 routes and end-to-end sample workflows in Chromium, Firefox and WebKit. Screenshots are retained in CI artifacts. Main requires `Design and browser gate`, including administrators; the Pages deployment depends on that successful job. No legacy branch publisher bypasses the gate.

## Try the journeys

1. Find a service and create a sample request using preset choices.
2. Open that request in the staff case queue and update its sample status.
3. Return to the citizen workspace to see the local change.
4. Read a sample message and save a preset local reply.
5. Simulate a sample payment, open its clearly labelled receipt and history.
6. Prepare a staff notice preview; save it locally without publishing or sending.
7. Reset changes on the sample profile page.

Sample state uses versioned session storage for the current browser tab only. No free-text personal fields, document uploads, card details or real citizens are included. Search terms are not persisted. Public information and module dependencies are cached for offline reading; citizen, staff and financial pages are excluded from the service worker allowlist. Browser HTTP caches are separate. Without JavaScript, public links and guidance remain readable, including mobile navigation; prototype mutations require JavaScript.

- [Design and navigation system](docs/DESIGN-SYSTEM.md)
- [Authentication prerequisites](docs/AUTHENTICATION.md)
- [Live integration boundaries](docs/INTEGRATIONS.md)
- [Original artwork provenance](docs/ASSETS.md)
- [Overhaul review evidence](docs/OVERHAUL-REVIEW.md)

Only `dist/` is published. No secret belongs in this public repository. Sites hosting and unrelated OpenAI runtime integrations are not used; the authorised existing GitHub Pages hosting is retained.
