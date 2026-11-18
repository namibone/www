# OneNam service-first design system

## Visual direction

A compact enterprise interface replaces the editorial landing page. Deep navy supplies the brand anchor; teal identifies actions and current location; amber consistently identifies prototype limitations; blue marks information. White surfaces, thin borders, restrained elevation and a shared spacing scale support scanning. The new geometric N mark generates SVG and 32/180/192/512-pixel icons from one source. The original labelled landscape artwork remains a small contextual asset on the public home.

Shared colors, fonts and dimensions live in `assets/tokens.css`; components and responsive rules live in `assets/global.css`. Page content is authored in `scripts/pages.mjs` and rendered through `scripts/ui.mjs`. There are no remote fonts or third-party runtime requests. Hover and entry transitions are brief and disabled for reduced motion. Charts include accessible summaries and text/tabular values. No decorative animation blocks a task.

## Information architecture

- Public: home, searchable service catalogue, eight service details, department directory and six details, notice centre and three notices, help, scope, sign-in status, privacy, accessibility, offline guide and site map.
- Citizen demo: dashboard, application list/detail/four-step creation, messages/detail, sample profile and reset.
- Staff demo: operations dashboard, filtered case queue/detail, preset communication composer and analytics.
- Financial demo: balances, review/confirmation, history and clearly labelled simulation receipts.

Every route has a breadcrumb and shared navigation. Current sections are marked with `aria-current`; detail pages retain their parent's section. Mobile navigation collapses only once JavaScript is working. Without JavaScript it stays visible, so public information remains reachable. Local case updates appear in both staff and citizen views in the same tab. There is no identity switch: both workspaces are public, synthetic prototypes.

## Quality and publishing gate

Main requires the GitHub Actions `Design and browser gate` check with strict branch freshness and administrator enforcement. Force push and deletion are disabled. Pages uses Actions and deploys only after quality succeeds. Administrators can change these settings; this is an enforced repository configuration, not an immutable policy.

Structural checks cover every output HTML file, a single H1/main landmark, shared stylesheet/icons, breadcrumbs, prototype and government-status disclosures, no private-data inputs, no inline code/style, no external runtime assets, links/anchors, full sitemap coverage, token-only colors (including CSS named colors and modern functions), defined tokens, reduced motion and focus. Each HTML page must stay below 40 KB and all public HTML/assets together below 650,000 bytes.

The generated service worker is executed in a controlled test to check that public paths are intercepted and query strings, unknown paths, external requests, non-GET requests and all workspaces are not. Forced network failures validate public navigation fallback and asset-error propagation. Browser tests independently compare the entire cache with the public manifest and confirm offline module-driven service filtering.

Playwright checks all 46 routes for automated WCAG A/AA issues, then exercises search and empty recovery, citizen-to-staff request progress, messages/replies, local notices, payment simulation/duplicate prevention/receipt/reset, invalid references, corrupted storage, keyboard/mobile navigation, no-JavaScript public access and offline boundaries in Chromium, Firefox and WebKit. Screenshots cover 390 and 1440 pixels; overflow checks also include 320 and 768. These checks do not substitute for a full manual assistive-technology audit.

## State and offline boundaries

Only preset sample choices and synthetic IDs enter `onenam-demo-v2` session storage. State is schema-checked and rendered with escaping; unknown references get explicit empty states. Reset affects only the current tab's sample state. No provider request, actual communication or monetary action exists.

Only 29 public routes and their supporting assets are precached. `assets/data.js`, the dependency imported by the public browser module, is included. No citizen/staff/payment/receipt route or query URL is added. Content hashes version the cache; installation reloads HTTP responses and activation removes only older `onenam-` caches after existing clients close. Browser cache restrictions may prevent saving. Public guide status reports success or unavailable state.
