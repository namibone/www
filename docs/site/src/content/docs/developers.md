---
title: Developer setup
description: Run the NamibOne gateway, N1 Wallet preview and documentation locally.
---

Use Git and Node.js 24 for the gateway and docs. Use Python 3 to serve the wallet preview locally. The sample journeys use data bundled with the projects.

## NamibOne gateway

```sh
git clone https://github.com/namibone/www.git
cd www
npm ci
npm run build
npm run dev
```

Open [the local gateway](http://127.0.0.1:4173/). To run the gateway’s full checks, install its Playwright browsers with `npx playwright install --with-deps chromium firefox webkit`, then run `npm run check`.

## N1 Wallet

```sh
git clone https://github.com/namibone/wallet.git
cd wallet
python3 -m http.server 4180 --bind 127.0.0.1
```

Open [the local wallet preview](http://127.0.0.1:4180/portal.html).

## Documentation

From the `www` checkout, run:

```sh
cd docs/site
npm ci
npm run dev
```

Open [the local docs](http://localhost:4321/docs/). Guides live in `src/content/docs/`. To check the production build, install Chromium with `npx playwright install --with-deps chromium`, then run `npm run check`.

## Project references

- [Gateway repository and checks](https://github.com/namibone/www#run-and-check)
- [Design system](https://github.com/namibone/www/blob/main/docs/DESIGN-SYSTEM.md)
- [Companion integration contract](https://github.com/namibone/www/blob/main/docs/COMPANION-INTEGRATION.md)
- [Integration boundaries](https://github.com/namibone/www/blob/main/docs/INTEGRATIONS.md)
- [Wallet source](https://github.com/namibone/wallet)
