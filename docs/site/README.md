# NamibOne Docs

Public getting-started guides for the NamibOne pilot. Astro Starlight builds a static site with a local Pagefind search index. The gateway's Pages workflow publishes the site under `/docs/`.

## Local development

```sh
npm ci
npm run dev
```

Use Node.js 24 and open `http://localhost:4321/docs/`. For the release checks, run `npx playwright install --with-deps chromium` once, then `npm run check`.

Astro writes `dist/` relative to the site root. Keep `NAMIBONE_DOCS_ORIGIN` and `NAMIBONE_DOCS_BASE` set to the deployment origin and mount path when building for another host. For a standalone host at the domain root, set the base to `/`.

## Documentation maintenance

| Content | Review role | Source |
| --- | --- | --- |
| Citizen and staff quickstarts | NamibOne gateway maintainers | [Gateway repository](https://github.com/namibone/www) |
| Wallet quickstart | N1 Wallet maintainers | [Wallet repository](https://github.com/namibone/wallet) |
| Pilot scope, help and release notes | NamibOne docs maintainers | Pilot scope and current site behavior |
| Developer setup | Repository maintainers | Package scripts and workflow files in both repositories |

Walk through the changed steps on a phone or mobile viewport. Record the verification date and tested commit in the pull request, and update the affected guide in the same release as a change to its workflow. Keep approved public content in this site and restricted pilot material in the team's authenticated workspace.

English is the root locale. Add approved language editions under the locale path with the same document slugs. Review the translated guide, navigation labels, fallback notices and search results with a fluent reviewer before adding the language to the picker.

The brand mark and Namibia-inspired illustration are reused from the gateway. The provenance of both assets is in [the gateway asset notes](https://github.com/namibone/www/blob/main/docs/ASSETS.md).
