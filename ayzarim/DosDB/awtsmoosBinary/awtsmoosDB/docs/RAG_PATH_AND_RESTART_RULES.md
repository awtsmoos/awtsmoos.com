<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# RAG Path and Restart Rules

## Path resolution

The active RAG root is derived from the server database directory, `AWTS_DB_ROOT`, or the process working directory. Always inspect the running process, cwd, environment, and resolved root. A stale inherited absolute path is a configuration defect, not proof that vectors disappeared.

## Session identity

Read-only shard sessions are generation-bound. Device, inode, size, and modification time identify the opened file. Atomic replacement must invalidate the old session and reopen the new generation.

## Restart court

- Preserve production PID and port unless approval authorizes a restart.
- Use port 8081 and an isolated RAG root for rehearsal.
- Probe both strict route spellings for every indexed lane.
- Stop the isolated server, verify the port closes, start it again, and repeat the full matrix.
- Compare live database stat and SHA-256 before and after.

## Failure rule

A process that binds a port is not ready. Readiness requires real local query embeddings, persisted HNSW provenance, nonempty payload-bearing hits, and no fallback.
