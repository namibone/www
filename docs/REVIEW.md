# Pre-release review — 18 November 2026

CodeRabbit CLI 0.7.5 reviewed the portal changes against the original main branch. It completed successfully using its free CLI allowance; the OneNam repository was not connected to an accessible CodeRabbit organization plan.

CodeRabbit raised **8 issues: 6 minor and 2 trivial**, with no critical or major issues. Each was checked against the code and addressed:

| Issue | Resolution |
| --- | --- |
| Offline installer failure could leave the initial status indefinitely | Observe installing-worker state and explain failed installation; keep the ready success path. |
| Cache boundary gate depended on one source string | Execute the generated fetch handler with public, private, query-string, external and non-GET cases. |
| Offline test could miss a controller change | Use bounded Playwright polling for the active controller. |
| New cache version could receive stale HTTP-cached files | Precache with `Request` cache mode `reload`. |
| Literal CSS keywords/new color functions bypassed tokens | Reject CSS named colors and modern color-producing functions as well as hex/RGB/HSL. Negative controls verify rejection. |
| Offline test checked only a few forbidden path patterns | Compare the complete cached path set with the public output allowlist. |
| Local preview could reject if its 404 page was unavailable | Fall back to a completed plain-text 404 response. |
| Missing cached navigation failed without a helpful page | Fall back to the cached offline guide for allowlisted navigation only; private/unknown paths remain untouched. |

The fixes were validated with the design gate and browser tests. The installation-failure status test uses an explicit service-worker API test double; real offline caching, navigation and missing-cache fallback are exercised against the actual worker. This is not a claim that CodeRabbit re-reviewed the final fixes, nor a manual assistive-technology conformance audit.

Additional hardening: each build clears only its generated `dist/` directory. A deliberately seeded stale file was removed, and the public-content hash stayed unchanged. Browser tests cover Chromium, Firefox and WebKit, including 320/390/768/1440-pixel layouts. All seven public pages receive automated accessibility checks. Desktop/mobile screenshots were visually reviewed. No live authentication tests were possible because authentication is unconfigured.
