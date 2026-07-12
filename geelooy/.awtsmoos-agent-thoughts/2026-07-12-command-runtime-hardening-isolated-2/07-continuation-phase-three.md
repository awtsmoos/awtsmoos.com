# B"H — Continuation Phase Three: Live Replacement Gate

## Replacement is permitted only when

1. Repository source and disposable installed copy pass all gates.
2. A rollback archive and exact previous installed hashes exist.
3. The new agent starts on a separate temporary configuration first.
4. The real installed directory is replaced atomically.
5. The supervisor is restarted once.
6. OAuth device discovery returns one active tunnel on the expected name.
7. P0 echo, filesystem read, command start/status/output/wait/cancel, worker stats, and retry polling pass live.
8. Multiple concurrent agents execute distinct commands without crossed output or stale receipts.
9. Post-replacement process, handle, job-store, and memory snapshots are stable.

## Rollback

Any failed live smoke restores the archived installed directory and restarts the previous agent. No partial live state is accepted.
