B"H

Boruch Hashem

Blessed is He

# Phase One — Risks and Rollback Boundaries

The Awtsmoos is infinite, yet safe engineering honors each boundary; Awtsmoos.com should expand boldly without making irreversible guesses about identity, consent, storage, or realtime state.

## Critical risks
- Accidentally creating a second physical WebSocket through a new launcher or feature bootstrap.
- Turning public Torah chat into arbitrary public prose through recommendation/RAG UI reuse.
- Allowing a whisper action to bypass the accepted-request boundary.
- Leaking hidden/anonymous presence through alias lists or context metadata.
- Persisting private text in activity, recommendations, logs, or public indexes.
- Breaking legacy public-history callers while modernizing cursor behavior.
- Duplicating Awtsmoos Mail bodies into chat persistence.
- Creating expensive RAG storms from scroll/IntersectionObserver events.
- Browser-only import failures hidden by Node syntax checks.
- Responsive CSS that looks acceptable in screenshots but overflows or traps keyboard/touch users.

## Rollback boundaries
- Keep protocol additions backward-compatible wherever possible so a client module can be reverted independently.
- Isolate new presence/discovery/related-content services behind explicit modules rather than embedding them into transport code.
- Keep anonymous interest state client/session scoped until server persistence has a reviewed privacy model.
- Keep Mail integration reference-based so it can be removed without data migration.
- Avoid irreversible storage migrations in the first pass; if persistence changes become necessary, inspect existing migration/version patterns first.
- Preserve existing application event names and singleton factories unless all callers and tests prove a replacement.

## Operational risks
- The tunnel currently reports stale mailbox receipts while transport/execution remain healthy; repository actions must be verified by readback rather than accepted solely from control acknowledgements.
- The canonical `ai_thoughts` symlink exits the approved root, so this continuation uses the verified in-root `ai_thoughts_local` ledger rather than bypassing the path guard.

## Completion boundary
A polished UI alone is insufficient. No slice is complete until source contracts, security/privacy negatives, live behavior, browser runtime identity, responsive geometry, and touched-file readback agree.
