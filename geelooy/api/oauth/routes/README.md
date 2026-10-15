# B"H — OAuth routes (`/api/oauth/routes/`)

HTTP handlers for the authorization flows.

## Key files

- `authorize.js`, `authorizeRequest.js`, `authorizeView.js`, `authorizeStyles.js` — Authorization endpoint + consent UI.
- `deviceAuthorization.js`, `deviceVerification.js`, `deviceGrant.js`, `deviceView.js`, `deviceStyles.js` — Device flow.
- `clients.js`, `register.js` — Client management and dynamic registration.
- `start.js`, `logout.js`, `me.js`, `metadata.js`, `table.js` — Session and discovery.
- `agentCallback.js`, `agentHandoff.js`, `agentLinkGrant.js`, `agentLinks.js` — Agent delegation.
