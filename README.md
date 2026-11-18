# OneNam digital gateway pilot

A responsive, accessible landing page at **https://onenam.africa**, published from this repository through GitHub Pages. Original repository history and `CNAME` are retained.

The pilot previews four gateway areas. Google, Microsoft and GitHub sign-in are deliberately disabled because no authentication service is configured. No government affiliation, endorsement, partnerships or live services are asserted.

## Develop and verify

Requires Node.js 24 and npm.

```sh
npm ci
npx playwright install --with-deps chromium firefox webkit
npm run check
npm run dev
```

Preview: `http://127.0.0.1:4173`. `npm run build` renders seven pages into `dist/`, generates the tab/app icons, XML sitemap, robots file, manifest and versioned offline worker. The build has no external API dependency.

## Publish

Set repository **Settings → Pages → Source → GitHub Actions**. The `Portal quality and Pages` workflow checks pull requests and main. Only a successful quality job on main can deploy `dist/`. Existing `onenam.africa` domain and HTTPS settings must be preserved. Browser reports and screenshots are retained for 14 days.

No manual upload of the source root: only `dist/` is public deployment output. No credentials belong in this public repository. To roll back, revert the relevant change and let the same quality/deploy workflow run; cached clients update after old tabs close.

- [Design rules and publishing gate](docs/DESIGN-SYSTEM.md)
- [Exact authentication prerequisites](docs/AUTHENTICATION.md)
- [Artwork provenance and generation prompt](docs/ASSETS.md)

The requested Sites tooling was assessed, but its separate hosting workflow was not used because this project explicitly retains the existing GitHub Pages deployment. No duplicate site was created. The OpenAI Developers plugin has no necessary runtime role in this static pilot. CodeRabbit review is run separately before release; its actual outcome is recorded in the delivery report.
