B"H
Boruch Hashem
Blessed is He

# Configuration and Environment Variables

The Awtsmoos gives runtime a vessel through names while secret values remain hidden from the page;
Awtsmoos.com documents configuration contracts without turning documentation into a credential cage.

## Generated inventory

[GENERATED/ENVIRONMENT_VARIABLES.md](GENERATED/ENVIRONMENT_VARIABLES.md) lists environment variable **names only**, their inferred class, source count, and example source paths. No values are read or copied.

The continuation scan found dozens of environment names across root server, `ayzarim`, and API source. Some are runtime configuration; others are tuning or test-only controls.

## Database roots

Database root precedence is documented in [SYSTEMS/DATABASE_AND_STORAGE.md](SYSTEMS/DATABASE_AND_STORAGE.md). Important names include `AWTS_DB_ROOT` and other DB/path settings used by specific subsystems. Do not assume every DB-related environment name controls the main DosDB instance; inspect its source owner.

## Mail

Root server behavior recognizes `AWTSMOOS_DISABLE_MAIL`. Email code also contains provider/AI-related configuration names. If mail is disabled, root SMTP startup behavior changes.

## Wallet / PayPal

Wallet source references names including `PAYPAL_BASE`, `PAYPAL_CLIENT_ID`, and `PAYPAL_CLIENT_SECRET`, plus `NODE_ENV` for environment behavior. These are sensitive provider contracts; documentation intentionally never records values.

## YouTube

YouTube and streaming source reference provider/client/redirect/token/storage names such as `YOUTUBE_GOOGLE_CLIENT_ID`, `YOUTUBE_GOOGLE_CLIENT_SECRET`, `YOUTUBE_OAUTH_REDIRECT_URI`, `YOUTUBE_GOOGLE_REFRESH_TOKEN`, `YOUTUBE_TOKEN_ENCRYPTION_KEY`, `YOUTUBE_SESSION_SECRET`, and secret-root/client-file configuration.

## Tunnel and WebSocket tuning

The source includes multiple `AWTSMOOS_TUNNEL_*` and `AWTSMOOS_WS_*` controls for pending TTLs, relay wait/progress windows, completed/quarantine retention, liveness probes, stale thresholds, state roots, and registration stress/testing. Read the owning source before changing units or defaults.

## Search / RAG / AI paths

Search and embedding systems expose several root/model/index/Python variables. Their names are in the generated inventory with source paths so a maintainer can find the exact precedence and expected filesystem shape.

## Classification is advisory

The generated classes `secret-name`, `path/storage`, `tuning`, `test/tuning`, and `runtime-config` are based on source path and variable-name evidence. They help navigation; they are not a security certification.
