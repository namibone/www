# Service portal overhaul review — 18 November 2026

CodeRabbit CLI 0.7.5 completed a review of the overhaul against the previous release using its free CLI allowance. It raised **four issues: three minor and one trivial**. All were checked and addressed:

1. Keep staff status updates in place so a focused save control is not removed; announce the result in the existing live region. Keyboard focus retention is tested.
2. Keep empty status regions in the accessibility tree; collapse their margin rather than hiding the region.
3. When browser storage fails, do not redirect to a missing payment receipt or offer tracking for a request that cannot persist. Show a persistent page-level explanation and explicitly confirm that no money or official request moved. Blocked-storage tests cover both flows.
4. Use one public-offline predicate for precaching and the generated route manifest so omitted and explicitly public section values behave consistently.

Independent UX review also identified and verified these release fixes:

- Mobile public navigation remains visible without JavaScript. The collapsed menu is enabled only after the module loads.
- The public module's `assets/data.js` dependency is explicitly precached.
- Homepage search uses fragment state so it works from the saved public homepage without admitting query URLs into the offline cache.
- Pages restored from back/forward cache reload their tab-local state before further interaction; the old main content is made inert during reload. A simulated persisted-pageshow test verifies newer stored state is respected.
- Future identity callbacks and all citizen, staff and payment pages are outside the offline allowlist. The current disabled-sign-in explanation is a public informational page; enabling real sign-in requires updating the integration and cache contracts.

Other verification found and fixed sitemap target spacing and narrow-screen table overflow. Tables now establish their own positioning context so hidden accessible labels do not expand the page outside the horizontally scrollable table. Recent requests sort by date, newest first.

The gate contains 46 all-page accessibility tests and 10 interaction/edge-case tests per browser, across Chromium, Firefox and WebKit. The authoritative final results are the PR and release workflow runs for the exact deployed commit. The initial local Firefox full run was stopped after host-dependent timeouts; this is not presented as a successful final run. Targeted local checks and visual screenshots supplement the clean CI run.

This is not a claim that CodeRabbit re-reviewed the fixes, that a manual screen-reader conformance audit is complete, or that identity, government APIs, communications or real payments have been end-to-end tested. Those live integrations are not configured.
