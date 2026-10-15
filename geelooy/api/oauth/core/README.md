# B"H — OAuth core (`/api/oauth/core/`)

Token, client, device-flow, scope, and PKCE internals.

## Key files

- `accessToken.js`, `tokenMaker.js`, `tokenDecoder.js`, `tokenReader.js` — Token lifecycle.
- `refreshStore.js`, `codeStore.js` — Refresh tokens and auth codes.
- `clients.js`, `dynamicClientStore.js`, `dynamicClientPolicy.js` — Client registry.
- `deviceCodes.js`, `deviceStore.js`, `devicePolicy.js`, `deviceVerifyLimiter.js` — Device flow.
- `scopes.js`, `scopeEvolution.js` — Scope catalog.
- `pkce.js` — PKCE verification.
- `serverMetadata.js`, `serverSecret.js`, `resourceIndicator.js` — Server metadata.
- `currentUser.js`, `requestBody.js` — Request context helpers.
- `agentHandoffPolicy.js`, `agentHandoffStore.js`, `agentLinkPolicy.js`, `agentLinkStore.js`, `agentLinkFile.js` — Agent delegation.
