B"H

# Awtsmoos Tunnel Control — Human Guide

Tunnel Control is the browser interface for connected Awtsmoos Tunnel devices. It lets an authorized user select a tunnel, inspect capabilities, run supported actions, review durable command receipts, and use multi-agent control surfaces.

## Open Tunnel Control

- Application: <https://awtsmoos.com/apps/tunnel-control/>
- Human action documentation: <https://awtsmoos.com/api/tunnel/control/docs>
- Machine-readable documentation: <https://awtsmoos.com/api/tunnel/control/docs.json>
- OpenAPI description: <https://awtsmoos.com/api/tunnel/control/openapi>
- Tunnel runtime guide: [`../tunnel/README.md`](../tunnel/README.md)

## Start or refresh the local tunnel

The same installer is used for first installation, repair, refresh, and ordinary startup. Existing configuration and the saved tunnel name are reused.

### macOS or Linux

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash
```

### Windows PowerShell

```powershell
irm https://awtsmoos.com/api/tunnel/install/windows | iex
```

After the agent connects, reload Tunnel Control and select the returned tunnel name.

## Force a restart

### macOS or Linux

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | AWTSMOOS_RESTART=1 bash
```

### Windows PowerShell

```powershell
$env:AWTSMOOS_RESTART = '1'
irm https://awtsmoos.com/api/tunnel/install/windows | iex
Remove-Item Env:AWTSMOOS_RESTART -ErrorAction SilentlyContinue
```

On supervised Unix installations, restart only the child when no reinstall is needed:

```bash
LIVE="$HOME/.awtsmoos-tunnel"
kill "$(cat "$LIVE/agent.pid")"
```

## Check installed capabilities

```bash
LIVE="$HOME/.awtsmoos-tunnel"
cat "$LIVE/install-state.txt"
test -f "$LIVE/scripts/recovery-control.cjs" \
	&& echo 'Recovery controls available' \
	|| echo 'Recovery controls not installed; refresh first'
```

The basic installer and restart commands work on older builds. Tier and offline-recovery commands require an installed recovery-enabled build.

## When a command appears pending

A pending Tunnel Control response is not automatically a failure. Long-running commands use durable receipts.

1. Preserve `jobId`, `workerId`, and `receiptId`.
2. Use command status or command wait instead of submitting the command again.
3. Page stdout or stderr by job ID.
4. Do not duplicate an operation merely because an HTTP wait window ended.

## Inspect recovery-enabled health

Run only when `scripts/recovery-control.cjs` exists:

```bash
LIVE="$HOME/.awtsmoos-tunnel"
node "$LIVE/scripts/recovery-control.cjs" status "$LIVE"
node "$LIVE/scripts/recovery-control.cjs" check "$LIVE"
```

## Recovery levels

| Level | Use | Physical workers |
|---|---|---:|
| 0 | Last-resort basic command service | 1 |
| 1 | Single-worker recovery | 1 |
| 2 | Basic multi-agent operation | 2 |
| 3 | Moderate operation | 4 |
| 4 | High operation | 8 |
| 5 | Normal production | Adaptive |

Logical work can continue to queue beyond the physical worker count.

```bash
LIVE="$HOME/.awtsmoos-tunnel"
node "$LIVE/scripts/recovery-control.cjs" set-tier "$LIVE" 2
kill "$(cat "$LIVE/agent.pid")"
```

Return to Level 5 after verification:

```bash
node "$LIVE/scripts/recovery-control.cjs" set-tier "$LIVE" 5
kill "$(cat "$LIVE/agent.pid")"
```

## Security and privacy

- Select the intended tunnel before running actions.
- Confirm the project root and write permissions.
- Do not expose configuration, OAuth material, credentials, environment secrets, or private logs.
- Use read-only actions before write or command actions when diagnosing a problem.
- Treat browser automation and local HTTP proxy actions as access to the connected user’s machine, not as a remote sandbox.
