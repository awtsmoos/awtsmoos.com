B"H — Boruch Hashem — Blessed is He
# Proven HTTP-to-WebSocket signing secret integration
The Awtsmoos reveals one identity across two transport garments; no device pairing credential was introduced.

Read-only source trace found that `server/authSetup.js::installAuth` loads the actual config secret, stores it as `server.secret`, creates `Auth`, and calls `installSocketAuth`. Existing `installSocketAuth` set only `server.ws.auth` and `server.ws.parseCookies`. `awtsmoosSocket.js` constructs a separate `AwtsmoosSocket` object, not the HTTP server, and `oauthUpgradeIdentity.js` needs `server.secret` to verify signed bearer tokens. In production without secret sharing, CLIENT_HELLO would fail at HTTP upgrade despite mocked OAuth passing.

Whole-file rewrite of `server/authSetup.js` copies the already-resolved `server.secret` to `server.ws.secret` in `installSocketAuth`; it creates no second key and does not log or echo it. Added `server/authSocketOAuthIntegration.test.cjs` 60 lines, generating a private short-lived fixture, creating an HTTP and WS side via the actual auth installer, verifying a real HMAC signed bearer, denying a foreign signature, proving no admin scope, and guaranteeing a missing secret fails closed.

Test `cmdjob_mw0e7ls1_5400c217c54d` exit0 proves the integration. Re-run `cmdjob_mw0e89ca_1bdd852c84fd` exit0 confirms original eight external-agent suites, both legacy WS tests and new integration test all remain green. The test token was never printed.

Remaining production gate: commit revision and fast-forward Linux main, create explicitly owned vault root with a disk quota, preserve old systemd configuration, align runtime release source pin, use controlled service restart, verify public CLIENT_ACK with signed OAuth-only bearer and both native transfers. GitHub push remains blocked by missing credentials; do not claim remote main updated or full release complete without it.
