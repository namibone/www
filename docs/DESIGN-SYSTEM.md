# OneNam design contract

## Direction

Warm paper, deep ocean ink and burnt dune accents reference Namibia's desert and Atlantic coast. The supplied image-search screenshot informed the palette and landscape direction only. Its third-party photos were not copied. Large editorial serif headings balance a compact system sans-serif interface. No remote fonts, tracking or runtime libraries.

## Shared system

`assets/tokens.css` owns colors, typography, spacing, radii and the content width. `assets/global.css` owns responsive layouts, components, visible focus and reduced motion. All pages are rendered through one layout in `scripts/build.mjs`; navigation, metadata, footer, icon and styles cannot drift per page. SVG icons share a 24-unit grid and one stroke treatment. The OneNam dune-and-horizon mark generates SVG and 32, 180, 192 and 512-pixel icons from the same source.

Only tokens may introduce literal CSS colors or font families. Spacing/radius tokens are provided for common patterns; responsive layout values may be explicit. Main text must pass WCAG AA contrast. Disabled buttons remain readable and include a nearby explanation. Core content works without JavaScript; enhanced service previews use native dialogs with keyboard dismissal and focus restoration.

## Enforced publishing gate

`npm run check` builds the site, runs structural design checks and browser tests. The Pages deployment job has `needs: quality`, so failed checks prevent publication. GitHub Pages must use **GitHub Actions**, not a legacy branch publisher, for this deployment gate to be effective. Repository administrators can change workflow/settings; it is not an immutable policy.

The main branch requires the GitHub Actions `Design and browser gate` check on an up-to-date branch, including for administrators. Force pushes and branch deletion are disabled. These protection settings were configured for the pilot release.

Structural checks enforce shared styles, known color/font tokens, focus and reduced-motion rules, canonical domain, document language, one H1 and main landmark, icons/metadata, alt attributes, working local paths/anchors, no inline CSS/JS, no external runtime assets, honest disabled providers, sitemap coverage, offline allowlist boundaries and a 650,000-byte budget for public HTML and assets.

Chromium, Firefox and WebKit tests check automated accessibility on all pages, dialog keyboard flow, provider disabled state and absence of third-party calls, 320/390/768/1440-pixel overflow, JavaScript-disabled navigation, reduced motion and offline reload/navigation. Screenshots are retained as CI artifacts. Visual review of screenshots remains necessary for subjective design quality. Automated checks are not proof of full accessibility conformance.

To see the structural gate reject a regression, temporarily add a literal CSS color to `assets/global.css`, rebuild, and run `npm run check:design`; restore the original file immediately. To see the publishing gate, inspect the `needs: quality` dependency in `.github/workflows/pages.yml`.

## Offline behavior

The build hashes all public cached content into a versioned cache name. Installation precaches only explicit public paths and fails if any is missing. An update waits for existing clients to close, preserving a consistent saved version; new activation removes only old `onenam-` caches. No query URL, private API or external response is cached. Reload after closing old tabs to pick up an updated offline version. Private browsing/storage pressure can prevent or evict offline data.
