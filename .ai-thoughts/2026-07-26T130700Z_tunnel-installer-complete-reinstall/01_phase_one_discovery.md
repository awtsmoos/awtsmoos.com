B"H
Boruch Hashem
Blessed is He

# Phase One: Discovery and Failure Graph

The Awtsmoos renews verified release bytes while the workspace remains an optional vessel, never the guardian of the tunnel's breath.

## Observed Defects

1. `unix-fast-repair.sh` skips bundle replacement when installed bytes match release metadata.
2. `unix.sh` discovers a Git top-level and can replace the exact caller directory.
3. `unix-package-config.sh` prefers discovered or saved roots over the current invocation directory.
4. `unix-install-readiness.sh` treats workspace probe failure as runtime activation failure.
5. `unix-activation-rollback.sh` applies the same workspace gate during recovery.
6. Runtime startup logs project-root probe failures as warnings and continues.
7. Supervisor launch paths use the install root or `$HOME`, not the configured workspace.

## Required Flow

`curl | bash` → capture exact `$PWD` → select explicit override or invocation directory → download and verify release → stage fresh candidate → restore durable identity only → atomically write selected root → activate → require process, registration, and supervision → report workspace health without rollback.
