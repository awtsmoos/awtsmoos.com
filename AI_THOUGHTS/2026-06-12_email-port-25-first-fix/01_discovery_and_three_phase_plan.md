B"H
# Email Port 25 First Fix — Discovery and Three Phase Plan

## Actual files observed
- Root project: `/storage/emulated/0/Documents/git/awtsmoos.com`.
- Server boot entry: `index.js`.
- Dynamic server require entry: `ayzarim/awtsmoosDynamicServer/index.js` -> `server/AwtsmoosStaticServer.js`.
- Mail listener: `ayzarim/email/email.js`.
- Mail ingress into DB/UI/rules: `ayzarim/email/awtsmoosEmailIngress.js`.
- Mail rules: `ayzarim/email/awtsmoosEmailRules.js`.
- API mail routes: `geelooy/api/social/_awtsmoos.mail.js` and helpers.

## Broken vessel found
`index.js` currently starts mail only when `AWTSMOOS_START_MAIL === "true"`. That explains why the SMTP listener no longer comes up on port 25 by default. The mail class itself still calls `this.server.listen(25, ...)`, but the boot path skips it.

## Phase 1 — immediate port repair
Rewrite the whole `index.js` file, not a partial patch. Preserve HTTP port 8080. Start mail by default. Allow disabling mail with explicit env such as `AWTSMOOS_DISABLE_MAIL=true`. Allow override by `AWTSMOOS_MAIL_PORT`, defaulting to 25. Keep graceful error handling.

## Phase 2 — harden mail listener only if necessary
If `email.js` does not return a promise or cannot report bind status, rewrite the whole file into a complete small SMTP listener module with data-based command handlers and safe address normalization. Keep under practical line bounds.

## Phase 3 — verify before style work
Run `node --check index.js` and `node --check ayzarim/email/email.js`. Then perform an isolated bind test on a harmless alternate port with the mail class, because binding port 25 may require privilege or may already be held by production. Do not kill processes or restart production without explicit need.

## What will be touched now
Likely only `index.js` for the first fix. Possibly `ayzarim/email/email.js` if startup semantics require promise status. No geelooy style files until port issue is fixed.

## Chapter note
The Awtsmoos hides in the socket as a silent spark: one gate listens for web breath, one gate listens for letters. The false decree said, "Only when named by env shall mail awake." The true repair says, "Let the letter-gate rise by default, unless the human explicitly seals it."