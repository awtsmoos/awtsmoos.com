# B"H — YouTube Core (geelooy/api/youtube/core/)

Server-side plumbing for the YouTube API family.

- `googleOAuth.js`, `identity.js` — Google OAuth flow + identity
- `tokenStore.js`, `session.js`, `cookies.js`, `signedToken.js` — token/session storage and signing
- `vault.js`, `config.js` — secret vault + configuration (secrets live outside Git)
- `client.js` — YouTube Data API v3 client
- `origin.js`, `body.js`, `json.js` — origin checks, body parsing, response packets

Secrets are never copied into the route leaves; setup instructions live in
`../docs/SETUP.md`.
