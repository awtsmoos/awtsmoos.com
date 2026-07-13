B"H

# Awtsmoos Tunnel — AI Agent Instructions

These instructions govern AI agents operating through the Awtsmoos Tunnel application tree.

## Connection flow

1. Authenticate with Awtsmoos.com when required.
2. Discover the active device/tunnel automatically.
3. When one tunnel is connected, use its returned `tunnelName`.
4. When none are connected, tell the user to start or refresh the agent, then rediscover the device.
5. When several are connected, ask which returned tunnel name to use.
6. Never invent a tunnel name, project root, worker ID, job ID, receipt ID, or command result.

References:

- Human docs: <https://awtsmoos.com/api/tunnel/control/docs>
- Machine docs: <https://awtsmoos.com/api/tunnel/control/docs.json>
- OpenAPI: <https://awtsmoos.com/api/tunnel/control/openapi>
- Control panel: <https://awtsmoos.com/apps/tunnel-control/>

## Installer and restart commands

Normal install, repair, refresh, and startup:

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash
```

```powershell
irm https://awtsmoos.com/api/tunnel/install/windows | iex
```

Guaranteed forced restart:

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | AWTSMOOS_RESTART=1 bash
```

```powershell
$env:AWTSMOOS_RESTART = '1'
irm https://awtsmoos.com/api/tunnel/install/windows | iex
Remove-Item Env:AWTSMOOS_RESTART -ErrorAction SilentlyContinue
```

The installer preserves an existing runtime configuration and saved tunnel identity. Do not delete `config.json` merely to restart the service.

On supervised Unix installations, restart only the child when no file refresh is required:

```bash
LIVE="$HOME/.awtsmoos-tunnel"
kill "$(cat "$LIVE/agent.pid")"
```

## Verify installed capabilities before use

```bash
LIVE="$HOME/.awtsmoos-tunnel"
cat "$LIVE/install-state.txt"
test -f "$LIVE/scripts/recovery-control.cjs" \
	&& echo 'Recovery controls available' \
	|| echo 'Recovery controls unavailable'
```

Never invoke tier or restore commands merely because the repository source contains them. Verify that the connected installed runtime contains the required scripts. When they are absent, use the installer or forced installer restart and verify again.

## Required operating discipline

- Inspect real files and runtime state before making claims.
- Prefer read-only actions first.
- Never read secrets without explicit authorization and tunnel permission.
- Create a verified backup before changing executable or production files.
- Rewrite complete files; do not apply fragile partial replacements.
- Keep modules small, descriptive, and testable.
- Test syntax, focused behavior, integration behavior, installation, and live behavior as appropriate.
- Preserve the user’s existing tunnel identity and project root.

## Durable command protocol

`commandStart` is asynchronous and may return a queued or running receipt.

- Preserve `jobId`, `workerId`, `receiptId`, `command`, and `cwd`.
- Use `commandStatus`, `commandWait`, and `commandJobOutputPage` for follow-up.
- A relay timeout does not prove command failure.
- Reuse an exact returned retry payload rather than starting the original command again.
- Never duplicate a command because the first HTTP wait window ended.
- Treat correlation mismatches as quarantined evidence, not permission to weaken validation.

## Recovery-enabled health and levels

Run these only when `scripts/recovery-control.cjs` exists:

```bash
LIVE="$HOME/.awtsmoos-tunnel"
node "$LIVE/scripts/recovery-control.cjs" status "$LIVE"
node "$LIVE/scripts/recovery-control.cjs" check "$LIVE"
```

| Level | Physical command workers |
|---|---:|
| 0 | 1 |
| 1 | 1 |
| 2 | 2 |
| 3 | 4 |
| 4 | 8 |
| 5 | Adaptive production capacity |

Logical admission is unlimited by default; physical execution is bounded by the selected level.

```bash
node "$LIVE/scripts/recovery-control.cjs" set-tier "$LIVE" 2
kill "$(cat "$LIVE/agent.pid")"
```

Return to Level 5 after verification:

```bash
node "$LIVE/scripts/recovery-control.cjs" set-tier "$LIVE" 5
kill "$(cat "$LIVE/agent.pid")"
```

## Offline restore protocol

Run only when both `scripts/recovery-restore.cjs` and the selected recovery package exist:

```bash
LIVE="$HOME/.awtsmoos-tunnel"
RECOVERY="$HOME/.awtsmoos-tunnel-recovery"
node "$LIVE/scripts/recovery-restore.cjs" "$LIVE" 2 "$RECOVERY"
nohup bash "$LIVE/awtsmoos-supervisor.sh" "$LIVE" \
	>> "$LIVE/agent-supervisor.log" 2>&1 </dev/null &
```

After restoration, verify health, selected level, package checksums, preserved `config.json`, one read action, and one command action. Never edit immutable recovery archives in place.
