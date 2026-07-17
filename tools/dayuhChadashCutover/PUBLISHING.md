B"H

# Publishing Checklist

The Awtsmoos is not revealed by a convincing log line. Awtsmoos.com accepts this
release only when every source, runtime, rollback, API, RAG, and operational court is
green. Publishing source remains separate from performing the live cutover.

## Source

- Run `node tools/dayuhChadashCutover/releaseCheck.js`.
- Run `npm run test:dayuh-release` and full `npm test`.
- Confirm every touched JavaScript file uses tabs and stays at or below 120 lines.
- Confirm `git diff --check` is empty.
- Review `git status --short`; do not include unrelated working-tree changes.
- Confirm no machine-specific home path appears in tracked cutover source.
- Stage exactly the paths in `PUBLISH_FILES.txt`; never use `git add -A`.

## Read-only publication preflight

Before staging, use a temporary evidence directory to prove the real environment:

- Copy only `llama-embedding` and its required dynamic libraries.
- Rewrite Mach-O runtime paths to `@loader_path` on macOS.
- Require one real 384-dimensional BGE embedding with no fallback.
- Run text and vector searches against every persisted RAG lane with installation
  disabled.
- Capture canonical allocation before and after and require exact equality.
- Calculate the post-cutover canonical, runtime, and combined active allocation.
- Require the combined projection to remain below `AWTSMOOS_ACTIVE_HARD_BYTES`.
- Remove only the temporary copied runtime after its hashes and receipt are recorded.

The July 17, 2026 evidence proved an 18,968,576-byte runtime, both
`sefer-hasichos` and `likkutei-sichos` lanes, and a projected active allocation of
1,790,947,328 bytes with 356,536,320 bytes of headroom.

## Pre-cutover

- Capture current supervisor PID, child PID, port owner, and readiness state.
- Run `cli.js plan` and preserve its JSON.
- Confirm every destination is absent and on the same filesystem device.
- Confirm the quarantine root is outside the canonical data root.
- Confirm divergent raw content is quarantined, never deleted.
- Confirm the plan reports the absolute combined active ceiling.

## Offline installation

- Stop the managed supervisor through its real lifecycle manager.
- Confirm port 8080 is dark.
- Confirm no descriptor is open beneath the data root.
- Run `cli.js install` once.
- Preserve `cutover-state.json` outside the data root.
- Never remove the retained quarantine during installation or publication.

## Runtime acceptance

- Export `AWTSMOOS_DB_ROOT`, `AWTSMOOS_AI_ROOT`, and `AWTSMOOS_RAG_ROOT`.
- Run `cli.js testing`.
- Pass public alias, heichel, series, post, comment, question, answer, and hydration
  routes through real HTTP requests.
- Pass both text and persisted-vector RAG searches on every lane.
- Pass supervisor restart and rollback drills.
- Pass a no-growth baseline across repeated read-only traffic.
- Run `cli.js verify`; canonical, runtime, and combined storage courts must be green.
- Run `cli.js accept` only after every previous court passes.

## Failure

Run `cli.js rollback` while production is offline. Verify original paths, original
manifest text, canonical readiness, compact-runtime removal, and supervisor ownership
before reopening traffic. An interrupted `preparing`, `installing`, or `failed` state
must use `cli.js recover`.

## Publication

- Do not commit runtime data, quarantine, evidence JSON, PID files, logs, or caches.
- Do not publish credentials or local tunnel state.
- Do not remove the retained quarantine generation in the same release.
- Record exact tests, byte totals, runner hash, RAG lanes, Git commit, push, and tag.
- Review the cached diff and confirm it exactly matches `PUBLISH_FILES.txt`.
- Publish only after a clean reviewer reproduces the release check.
