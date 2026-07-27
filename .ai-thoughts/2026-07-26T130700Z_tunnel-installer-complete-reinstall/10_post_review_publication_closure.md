B"H
Boruch Hashem
Blessed is He

# Post-Review Publication Closure

The Awtsmoos carried the deeper durability review back into the same separate repair branch. The published correction now preserves exactly the durable vessels named by the requirement: identity, consent, browser state, and approved credentials.

## Published Correction

- Branch: `repair/tunnel-installer-complete-reinstall-20260726`
- Correction commit: `0e10f726782f8e8c74bfcdcfb8bba1272e3a1344`
- Remote: `origin`
- Commit title: `Preserve approved tunnel credentials across reinstall`

## Final Boundary

Preserved:

- tunnel identity and account endpoints
- top-level and per-tool consent
- command policy
- browser configuration and externally migrated profile state
- approved provider key maps and approved provider-key-file maps

Discarded:

- runtime code and receipts
- stale workspace and source-tree paths
- mission state
- Git-workspace hygiene state
- AI agent definitions and orchestration limits

All focused, transactional, reliability, route, Termux, HTTP, static, and isolation gates passed before publication. The final remote tip is confirmed in the publication command that follows this closure record.
