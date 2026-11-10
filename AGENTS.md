B"H

# Awtsmoos Root Agent Law

Inspect before claiming. Test before declaring. Never confuse mocks with real provider work. Provider secrets belong outside this repository, for example in `~/.awtsmoos-secrets`. For tunnel AI novel work, chapter delegates must keep going for the configured `agentCycles` / `chapterCycles` count, defaulting to eight full passes.

Rewrite complete files only. Prefer small modules and real verification.

## Hard rules — do not drift (owner, 2026-11-10)

- **Storage: AwtsmoosDB only. No JSON or JSONL as a database, ever** — no new `.jsonl` stores, no runtime-rewritten `state.json`. Full reasoning: `docs/AI/STORAGE-LAW.md`.
- **Bulk imports** follow `docs/AI/BULK-IMPORT-LAW.md`: batched durability, <100 ms/post target, never restart the service mid-import, every import ends with a full diff-verify.
- **Deploys** follow `docs/AI/DEPLOY-LAW.md`: BH.sh wipes dirty trees — commit and push your work immediately, path-scoped; stash-dance around other sessions' dirty files.
- **Never add images or asset binaries to this repo.** Assets live in the server's Drive storage system.
- Before optimizing or "fixing" a slow path, read `docs/AI/KNOWN-PATHOLOGIES.md` — the traps there are measured, not guessed.
- Several agent sessions share this server and this repo. Coordinate restarts and deploys in chat first; a restart during another session's import loses its in-flight batch.
