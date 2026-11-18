# Authentication launch prerequisites

## Current state

There is no authentication backend, provider registration, account database or authenticated session in this repository. The repository Actions secrets list was empty during setup on 18 November 2026. No credentials were requested, copied or published. The Google, Microsoft and GitHub controls are native disabled buttons with a visible explanation. No authentication claims have been end-to-end verified.

GitHub Pages serves static files only. Use a separately approved managed identity service or server backend while retaining the frontend at `https://onenam.africa`. The following is a proposed integration contract, not an existing service.

## Decisions and registrations required

1. Confirm the accountable OneNam operator, domain authority, privacy/support contact and permitted pilot audience. No government affiliation or endorsement has been verified.
2. Choose and authorize an identity backend and its hosting/budget. A suggested dedicated origin is `https://auth.onenam.africa`; creating it requires approved DNS and deployment configuration. Do not use a random existing tenant or another project's credentials.
3. Register separate development and production provider applications under the confirmed operator:
   - **Google:** OAuth web application; verified domain and consent branding; minimal `openid email profile` scopes; production callback `https://auth.onenam.africa/callback/google`.
   - **Microsoft:** Entra app registration; explicitly decide personal Microsoft accounts, organizational accounts, or a tenant allowlist; web callback `https://auth.onenam.africa/callback/microsoft`; minimal `openid email profile` scopes. Use authorization code with PKCE and OIDC.
   - **GitHub:** OAuth application; production callback `https://auth.onenam.africa/callback/github`; use only identity/email access actually required. GitHub is OAuth, not an OIDC sign-in provider. Exchange its code on the server; never expose the client secret in Pages or browser code.
4. Store provider client IDs and client secrets in the backend's encrypted secret store. The exact configuration keys should be `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `PUBLIC_APP_ORIGIN=https://onenam.africa`, `AUTH_ORIGIN=https://auth.onenam.africa`, and a server-only `SESSION_SECRET`. Rotate and scope secrets. These names describe a future contract; they are not consumed by this static site.
5. Implement `/login/{provider}`, the callbacks above, `/session` and CSRF-protected `/logout` on that backend. Fix return URLs to the approved frontend origin. Use secure HTTP-only host-only session cookies, appropriate SameSite settings, expiring sessions, per-request state, PKCE, nonce for OIDC, signature/issuer/audience/expiry validation, and a strict credentialed CORS allowlist. GitHub email alone must not silently link accounts. Use verified identities and explicit account linking.
6. Publish operator/contact, retention/deletion, terms and privacy disclosures. Confirm a support route before accepting accounts.

## Frontend changes after backend approval

- Replace disabled controls with real backend navigation only when each provider is verified. Add explicit pending, cancellation, provider-error, expired-session and offline states. Do not use a simulated local login or localStorage identity.
- Adjust CSP `connect-src` only for the approved backend. Keep secrets and tokens out of browser storage, URLs, logs and the public repository.
- Keep authenticated pages, callbacks and API responses outside the service worker public allowlist. Never add a catch-all cache rule. Session and callback responses must be `Cache-Control: no-store`.
- Replace the current gate assertion that all three providers are disabled with assertions for the configured provider list and secure failure states. A configuration switch alone is not sufficient.

## Required evidence before calling authentication functional

Run real end-to-end sign-in with an authorized test account on each configured provider, consent and cancellation, correct redirect URI, session reload, logout and expiration, disallowed tenant/audience, replayed code, invalid state/nonce/PKCE, and offline failure. Verify no secret or token in static output, browser caches, localStorage or logs. Record browser/version, deployment commit, provider, date and result; avoid personal details. Mocked tests cannot establish live authentication.

## Official references

- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect)
- [Microsoft authorization code flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
- [GitHub OAuth authorization](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)

OpenAI Developers was considered as requested. There is no OpenAI feature in this pilot, and an OpenAI API key is not needed for these provider sign-ins. No unrelated OpenAI integration or paid infrastructure was created.
