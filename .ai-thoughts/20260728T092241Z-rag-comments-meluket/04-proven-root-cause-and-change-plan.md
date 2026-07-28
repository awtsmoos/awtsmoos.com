# B"H — Proven root cause and final change plan

## Reproduced behavior

- Local and public `shard=meluket` text queries return the translated Meluket rows.
- Without a `comments` parameter, both sides return zero line comments because the route defaults comments to false.
- Local `comments=true` returns hydrated comments.
- Public `comments=true` reports `commentHydrationFallback: brideCommentRows is not defined`.
- Meluket manifest, metadata JSONL, and AWTSDB hashes match local and remote exactly.

## Changes

1. Rewrite `routes/values.js` so library comments default to true while explicit false remains honored.
2. Add a focused route-options regression test.
3. Keep local `commentSources.js` unchanged and deploy that already-correct file over the stale production typo.
4. Rewrite the Meluket manifest title and aliases so the public catalog clearly exposes Meluket while preserving the stable lane ID.
5. Restart local, verify default comments and explicit opt-out, then deploy exact files/assets with backup and rollback.
6. Verify public Meluket, multi-lane comments, catalog naming, hashes, service health, and no hydration fallback.
