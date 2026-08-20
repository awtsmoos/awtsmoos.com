B"H

# Awtsmoos Tunnel — AI Agent Instructions

These instructions govern agents operating through the Awtsmoos Tunnel tree. Inspect live reality first; never infer a tunnel, mission, lock, job, receipt, or server state from stale memory.

## Connection flow

1. Authenticate with Awtsmoos.com when required.
2. Discover the active device/tunnel automatically.
3. Use the returned tunnel identity; never invent one.
4. Distinguish public server health, authenticated control-session health, native parent/child health, and mission-controller health before choosing recovery.
5. If several tunnels are connected, ask which returned identity to use.

References: <https://awtsmoos.com/api/tunnel/control/docs>, <https://awtsmoos.com/apps/tunnel-control/>, <https://awtsmoos.com/apps/code>.

## Short recovery ladder

Prefer the packaged `awt` command over manual PID commands when it exists.

### macOS/Linux

```bash
~/.awtsmoos-tunnel/awt status
```

```bash
~/.awtsmoos-tunnel/awt check
```

```bash
~/.awtsmoos-tunnel/awt rescue --dry-run
```

```bash
~/.awtsmoos-tunnel/awt rescue
```

```bash
~/.awtsmoos-tunnel/awt normal
```

### Windows

```powershell
%USERPROFILE%\.awtsmoos-tunnel\awt.cmd status
```

```powershell
%USERPROFILE%\.awtsmoos-tunnel\awt.cmd rescue
```

`rescue` verifies supervisor-child ownership, sets Level 0, restarts only the verified supervised child, and waits for replacement. `normal` returns to Level 5 with the same guarded child restart. Unknown/typo commands make no mutation and should suggest the nearest valid command.

Offline restore is stronger and requires explicit confirmation:

```bash
~/.awtsmoos-tunnel/awt restore 0 --confirm
```

Never jump to reinstall/restore because a GPT OAuth/control session failed. A browser-tab tunnel in Awtsmoos Code is a separate fallback vessel.

## Failure-layer discipline

- OAuth/client failure: reauthorize/rediscover; do not restart a healthy native child merely for authentication failure.
- Native child wedged, supervisor verified: use `awt rescue`.
- Supervisor absent/unverified: inspect/refresh the signed install; do not signal an unverified PID.
- Server/API down: repair/deploy the server independently.
- Mission controller blocks writes: inspect mission/lock/question/authorization evidence. Do not bypass with shell redirection.
- Recovery level left at 0 after debugging: use `awt normal` and verify Level 5.

## Install or refresh

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash
```

```powershell
irm https://awtsmoos.com/api/tunnel/install/windows | iex
```

The installer preserves an existing runtime configuration and tunnel identity. Do not delete `config.json` to force a restart.

## Required operating discipline

- Read actual files and runtime state before claims.
- Prefer read-only evidence first.
- Never read secrets without authorization.
- Preserve executable/production backups and rollback evidence.
- Rewrite complete files; never use fragile partial replacements.
- Keep modules small, descriptive, and testable.
- Test syntax, focused behavior, integration behavior, packaging, and live behavior.
- Preserve the user's tunnel identity and project root.
- If mission write policy requires authorization, use the documented mission step/token path; never defeat the firewall with shell writes.
- Refrigerated/terminal missions are durable history, not active filesystem authority.

## Durable command protocol

`commandStart` and promoted heavy actions may be asynchronous. Preserve returned `jobId`, worker/receipt IDs, command, and cwd. Follow with status/wait/output actions. A relay timeout does not prove command failure; inspect durable action/job history and never duplicate work merely because an HTTP wait ended.

Treat response correlation mismatches as quarantined evidence, not permission to weaken validation.

## Recovery levels

| Level | Mode | Physical workers |
|---|---|---:|
| 0 | Emergency | 1 |
| 1 | Single | 1 |
| 2 | Dual | 2 |
| 3 | Four | 4 |
| 4 | Eight | 8 |
| 5 | Production | Adaptive |

Logical admission and physical worker count are separate. After emergency verification, restore Level 5.

## Mission/watchdog recovery discipline

A multiple-choice watchdog reference must resolve to its original durable prompt/choices. Never invent A–E choices for a missing payload. If recovery reports `question_payload_missing`, preserve mission evidence and use the suggested mission inspection/manual recovery path; unrelated filesystem authority should not remain permanently locked.

If a refrigerated/terminal mission appears to own an exclusive project-root lock, reconcile mission lifecycle and lock authority rather than deleting mission history.

## Offline restore protocol

Use offline restore only after integrity evidence justifies it and the selected recovery archive exists. Preserve `config.json`, recovery archives, checksums, and tunnel identity. Verify status/check, selected level, one read action, and one command action after restoration. Never edit immutable recovery archives in place.
