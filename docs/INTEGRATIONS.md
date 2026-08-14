B"H
Boruch Hashem
Blessed is He

# External Integrations

The Awtsmoos lets Awtsmoos.com meet external providers through explicit vessels while secret values and foreign failure remain outside the documentation itself.

## Awtsmoos OAuth

Source: `geelooy/api/oauth/`. Human docs: `docs/API/OAUTH.md`. OAuth bearer evidence can become a trusted identity source for Tunnel Control after server verification. Client registration, redirect validation, scopes, tokens and current-identity behavior remain source-controlled contracts.

## YouTube / Google

Source: `geelooy/api/youtube/` plus YouTube/streaming clients. Human docs: `docs/API/YOUTUBE.md`. Configuration includes client, redirect, refresh-token, encryption/session and secret-root concepts; the generated environment inventory lists names without values.

## PayPal / Wallet

Source: `geelooy/api/wallet/`. Human docs: `docs/API/WALLET.md`. Purchase, capture, entitlement and provider behavior must be read from current handlers/tests; mock purchase routes are not production settlement guarantees.

## SMTP / email

Root server startup, `geelooy/api/email/`, Contact, Social mail and browser email interfaces are related but distinct. `AWTSMOOS_DISABLE_MAIL` affects mail startup in inspected root behavior.

## SSH

Source: `geelooy/api/ssh/` plus server-side SSH infrastructure. Remote command/filesystem operations are security-sensitive; credentials and remote mutations must never be documented as reusable live examples.

## AI/model providers

GPT API, browser AI, local GGUF tooling, search/vector systems and developer AI integrations can use different providers/models/configuration. Do not collapse them into one credential or schema.

## Streaming connectors

`geelooy/api/streaming/` dispatches connector/action behavior. Observed connector families include Awtsmoos, Facebook, Twitch and YouTube. Each connector owns provider-specific payload and credential semantics.

## Fetch proxy

`/api/fetch` is a server-side outbound-fetch surface with auth/origin/limit/binary behavior; it should not be described as an unrestricted generic proxy.

## Configuration and secrets

Use `docs/CONFIGURATION.md`, `docs/SECURITY/SECRETS_AND_CONFIG.md` and `docs/GENERATED/ENVIRONMENT_VARIABLES.md`. The generated layer intentionally records names and source ownership, never secret values.
