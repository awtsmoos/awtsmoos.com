B'H
# Social System Stress Certification — Phase Plan

## Mission
Certify the live social/comment system by reading real source, reading real storage, executing real API and storage stress, verifying persistence and concurrency, and refusing to reintroduce any duplicate comment authority.

## Phase 1: Map reality
- Read routing files under geelooy/API/social.
- Read helpers for series, posts, comments, aliases, permissions, search, packed/storage bridges.
- Read ayzarim DB/server code.
- Locate DB root ../dayuhChaaddash from WoW/BH/awtsmoos.com context.
- Locate existing data directories and authority paths.

## Phase 2: Threat model and test matrix
- Series: nested, move/delete/tree/search/count/index.
- Posts: bulk, long/unicode/html/markdown, indexes and delete disappearance.
- Comments: single authority path, no mirror, root/replies/deep chains/edit/delete/restart.
- Aliases: create/edit/delete, stale references, ownership.
- Permissions: owner/editor/viewer, forged identity and alias IDs.
- Search: create/edit/delete freshness.
- AwtsmoosDB: reachability, orphan detection, duplicate authority scans.
- Restart/concurrency: repeated server restart and simultaneous writes.

## Phase 3: Execution
- Run existing tests first only as baseline.
- Write or run diagnostic scripts without modifying production code.
- Prefer isolated certification records with unique IDs.
- Inspect production data non-destructively.
- Stop immediately if a reproducible correctness bug is found and report it.

## Absolute regression guard
Any copied comment storage, packed shard mirror, JSONL fallback, migration fallback, cache-backed authority, dual-write, or synchronization layer for comment authority is a regression.
