B"H
# Session and Password Security

## Session model
`awtsmoosKey` remains the compatible cookie name. Tokens remain HMAC-SHA256 signed and wire-compatible with recent legacy sessions, but signature validity is no longer treated as infinite authorization.

The canonical verifier is `ayzarim/tools/auth.js`. It serves both ordinary requests and WebSocket/session middleware, so lifetime enforcement belongs there rather than in individual pages.

## Lifetime policy
`ayzarim/tools/sessionPolicy.js` enforces:
- one-year absolute maximum session age;
- small future-clock-skew tolerance;
- rejection of malformed/future/expired tokens;
- v2 metadata with signed `expiresAt`, `version`, and random `sid`.

Recent legacy tokens are accepted until the same absolute age limit. This allows migration without forcing a mass logout.

## Cookie law
Login/registration cookies are expected to remain `HttpOnly`, `Secure`, `SameSite=Lax`, and `Path=/`. Logout clears the cookie with matching attributes and accepts only same-site/relative redirects.

## Password storage
New account password records use a versioned `scrypt-v1$...` representation. The verifier still understands the historic HMAC-SHA256 password record so existing accounts can log in.

Do not silently bulk-rewrite account records. A future lazy migration may replace a verified legacy hash only after account database update semantics are explicitly tested.

## What is not claimed
- `sid` is a future revocation handle; there is no proven server-side per-session registry yet.
- No tracked main-login WebAuthn/passkey/phone-key/OTP implementation was found during this mission.
- Separate Drive credential crypto is not evidence that the login cookie is device-bound.
- Therefore a copied valid token can be replayed until bounded expiry unless a future session registry/device-binding layer is added.

## Executable witnesses
- `ayzarim/tools/test/sessionSecurity.test.js`
- `ayzarim/tools/test/passwordStorage.test.js`
- `ayzarim/tools/test/serverTemplateSyntax.test.js`
- `geelooy/login/test/authSurfaceContract.test.mjs`
