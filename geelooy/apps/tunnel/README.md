B"H

# Awtsmoos Tunnel — Human Operations Guide

The Awtsmoos Tunnel connects this computer to Awtsmoos.com so authorized humans and agents can inspect files, run permitted commands, use browser automation, and operate project tools through the saved tunnel identity.

## Emergency recovery — use the shortest safe command first

Recovery-enabled installs now ship one guarded command. It verifies the supervised process relationship before signaling a child.

### macOS or Linux

```bash
~/.awtsmoos-tunnel/awt status
```

```bash
~/.awtsmoos-tunnel/awt check
```

```bash
~/.awtsmoos-tunnel/awt rescue
```

```bash
~/.awtsmoos-tunnel/awt normal
```

`rescue` is the safe emergency path: verify supervisor + child ownership, set Level 0, terminate only the verified supervised child, and wait for its replacement. `normal` returns to Level 5 and restarts only that verified child. Use `--dry-run` to preview either operation without changing tier or signaling a process.

Offline restore is intentionally stronger and requires confirmation:

```bash
~/.awtsmoos-tunnel/awt restore 0 --confirm
```

A typo such as `resuce` returns a suggested command and performs no recovery action.

### Windows

```powershell
%USERPROFILE%\.awtsmoos-tunnel\awt.cmd status
```

```powershell
%USERPROFILE%\.awtsmoos-tunnel\awt.cmd rescue
```

## Know which layer is broken

| Symptom | First action |
|---|---|
| ChatGPT/OAuth control fails but Awtsmoos.com is reachable | Reauthorize the control session; do not restart the Mac agent merely for an OAuth failure. |
| Native tunnel child is wedged but supervisor is alive | `awt rescue` |
| Tunnel is healthy but intentionally left in Emergency Level 0 | `awt normal` |
| `awt check` reports executable/manifest corruption | Inspect recovery evidence, then use confirmed offline restore. |
| Supervisor itself is absent/unverified | Refresh with the signed installer rather than blindly killing a PID. |
| Awtsmoos server/API is down | Repair the server independently; a Mac child restart does not repair the server. |

The browser-tab tunnel in Awtsmoos Code can be used as a separate fallback vessel when the native tunnel or its authenticated control session is unavailable.

## Install, refresh, or start

The installer is also the normal refresh/start entry point. It preserves an existing `config.json`, saved tunnel name, project root, and recovery history.

### macOS or Linux

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash
```

### Windows PowerShell

```powershell
irm https://awtsmoos.com/api/tunnel/install/windows | iex
```

A refresh verifies the manifest and candidate before activation. It should be preferred over deleting configuration or inventing a replacement identity.

## Recovery levels

Logical command admission is separate from physical subprocess concurrency.

| Level | Mode | Physical workers |
|---|---|---:|
| 0 | Emergency | 1 |
| 1 | Single | 1 |
| 2 | Dual | 2 |
| 3 | Four | 4 |
| 4 | Eight | 8 |
| 5 | Production | Adaptive to machine capacity |

Three rapid nonzero crashes can lower the active level automatically. After emergency verification, return to Level 5 with `awt normal`.

## Deep recovery tools

The short command wraps the existing recovery machinery rather than replacing it. Low-level scripts remain available for diagnosis and automation:

```text
~/.awtsmoos-tunnel/scripts/recovery-control.cjs
~/.awtsmoos-tunnel/scripts/recovery-restore.cjs
~/.awtsmoos-tunnel-recovery/tiers/level-0 ... level-5
```

Offline restoration stages and validates a known-good archive and preserves `config.json`. Do not edit immutable recovery archives in place.

## Control surfaces

- Control panel: <https://awtsmoos.com/apps/tunnel-control/>
- Human docs: <https://awtsmoos.com/api/tunnel/control/docs>
- Machine docs: <https://awtsmoos.com/api/tunnel/control/docs.json>
- OpenAPI: <https://awtsmoos.com/api/tunnel/control/openapi>
- Browser/code fallback: <https://awtsmoos.com/apps/code>

## Important runtime files

```text
~/.awtsmoos-tunnel/config.json
~/.awtsmoos-tunnel/install-state.txt
~/.awtsmoos-tunnel/agent.pid
~/.awtsmoos-tunnel/supervisor.pid
~/.awtsmoos-tunnel/recovery-state.json
~/.awtsmoos-tunnel/agent.log
~/.awtsmoos-tunnel/agent-supervisor.log
```

Do not publish `config.json`, private logs, credentials, OAuth material, or secret-like environment data.
