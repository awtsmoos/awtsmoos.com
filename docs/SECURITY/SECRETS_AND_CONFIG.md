B"H
Boruch Hashem
Blessed is He

# Secrets and Security-Sensitive Configuration

The Awtsmoos gives configuration a vessel while Awtsmoos.com must distinguish a variable name that may be documented from a secret value that must remain concealed.

## Documentation rule

Generated environment documentation records variable names, coarse classes and source ownership only. Never copy live values, token files, OAuth secrets, API keys, session cookies, provider credentials, SSH credentials or private machine paths into documentation merely to make setup look complete.

## Canonical authentication secret

The dynamic server's inspected `authSetup.js` reads `deps.config.secret` as a module path, requires that configured module, stringifies the resulting value and constructs the shared Auth verifier used by HTTP sessions and WebSockets.

If the configured secret cannot be required, the inspected fallback object contains `noKey: "No security"`. That fallback means deployment configuration for authentication deserves explicit review; documentation must not present a missing secret as an ordinary harmless default.

## API keys

Social API keys are created from cryptographically random bytes. The raw key is returned at creation; storage retains its SHA-256 hash and metadata. Documentation may describe the prefix/format conceptually, but must never include a real generated key.

Tunnel Control maintains a separate verified API-key system with its own scopes/account identity. Do not assume Social API keys and Tunnel Control keys share stores, scopes or header schemes.

## OAuth and provider secrets

OAuth, YouTube/Google, PayPal, streaming, email/SMTP and AI integrations can use provider-specific secret names. The generated environment inventory is a locator. The owning source determines required/optional status, defaults, redirect URIs, encryption, token persistence and lifecycle.

## Local configuration

`.awtsmoos.config.local.json` is an ignored machine-local configuration vessel used by database-root resolution. Documentation may name supported keys, but should not copy the actual local file or absolute private paths unless a troubleshooting task explicitly requires them.

## Debug and smoke flags

Debug/test environment flags can cause sensitive diagnostic material to appear. Social API-key verification, for example, has an inspected smoke-debug branch that can expose supplied-key prefixes, hashes, index paths and DB-root information in errors. Treat debug flags as security-relevant and disable them outside intended controlled testing.

## Review checklist

- Is the value secret or merely configuration?
- Where is it loaded?
- Does absence disable security or change trust behavior?
- Is it logged or included in errors?
- Is it persisted encrypted, hashed, plaintext or not persisted?
- What rotates/revokes it?
- Which tests exercise missing/invalid/expired credentials?
