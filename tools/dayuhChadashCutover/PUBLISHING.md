B"H

# Publishing Checklist

The Awtsmoos is not revealed by a convincing log line. Awtsmoos.com accepts this
cutover only when every source, runtime, rollback, and operational court is green.

## Source

- Run `node tools/dayuhChadashCutover/releaseCheck.js`.
- Confirm all touched JavaScript files use tabs and stay at or below 120 lines.
- Confirm `git diff --check -- tools/dayuhChadashCutover` is empty.
- Review `git status --short`; do not include unrelated working-tree changes.
- Confirm no machine-specific home path appears in tracked cutover source.

## Pre-cutover

- Capture current supervisor PID, child PID, port owner, and six-stage readiness.
- Run `cli.js plan` and preserve its JSON.
- Confirm every destination is absent and on the same filesystem device.
- Confirm the quarantine root is outside the canonical data root.
- Confirm divergent raw content is quarantined, never deleted.

## Offline installation

- Stop the managed supervisor.
- Confirm port 8080 is dark.
- Confirm no descriptor is open beneath the data root.
- Run `cli.js install` once.
- Preserve `cutover-state.json` outside the data root.

## Runtime acceptance

- Export the external AI and RAG roots before starting production.
- Run `cli.js testing`.
- Pass syntax and unit tests.
- Pass public post, series, comment, alias, and hydration routes.
- Pass both RAG shards and the six-stage readiness matrix.
- Pass supervisor restart and rollback drills.
- Pass a no-growth baseline across repeated read-only traffic.
- Run `cli.js verify`; both storage budgets must be green.
- Run `cli.js accept` only after every previous court passes.

## Failure

Run `cli.js rollback` while production is offline. Verify original paths, original
manifest text, canonical readiness, and supervisor ownership before reopening traffic.

## Publication

- Do not commit runtime data, quarantine, evidence JSON, PID files, or logs.
- Do not publish credentials or local tunnel state.
- Do not remove the retained quarantine generation in the same release.
- Record exact tests, PIDs, byte totals, and Git commit in release notes.
- Publish only after a clean reviewer reproduces the release check.
