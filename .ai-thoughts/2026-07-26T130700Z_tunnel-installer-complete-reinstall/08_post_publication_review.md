B"H
Boruch Hashem
Blessed is He

# Post-Publication Review

The Awtsmoos revealed one remaining durability gap after publication: the first bounded config allowlist preserved top-level consent flags and Chrome settings, but omitted nested tool and command consent plus approved AI credential maps.

## Correct Preservation Boundary

Preserve:

- tunnel and account endpoint identity
- top-level and per-tool consent
- command permission and execution policy
- browser configuration plus externally migrated browser profile state
- approved `providerKeys` and `providerKeyFiles`

Discard:

- stale workspace and source-tree paths
- mission activity
- Git-workspace hygiene state
- AI agent orchestration definitions and scheduling limits
- replaceable runtime code and transient receipts

The correction keeps only the approved credential maps from `aiAgents`, rather than preserving the entire orchestration object. Direct tests prove both preservation and deliberate discard.
