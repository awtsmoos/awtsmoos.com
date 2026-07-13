B"H

# Awtsmoos Tunnel — Human Operations Guide

The Awtsmoos Tunnel connects this computer to Awtsmoos.com so the control panel and authorized AI agents can inspect files, run permitted commands, use browser automation, and operate project tools through the saved tunnel identity.

## Open the control surfaces

- Control panel: <https://awtsmoos.com/apps/tunnel-control/>
- Human action documentation: <https://awtsmoos.com/api/tunnel/control/docs>
- Machine-readable documentation: <https://awtsmoos.com/api/tunnel/control/docs.json>
- OpenAPI description: <https://awtsmoos.com/api/tunnel/control/openapi>

## Install, refresh, or start

The installer is also the normal refresh/start entry point. It preserves an existing `config.json`, including the saved tunnel name and project root.

### macOS or Linux

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash
```

### Windows PowerShell

```powershell
irm https://awtsmoos.com/api/tunnel/install/windows | iex
```

Re-running the installer verifies the manifest, repairs missing files, installs a newer version when available, and starts the background agent.

## Force a complete restart

Use the restart flag when the runtime is installed but the current process is stale, wedged, or must be replaced immediately.

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

## Restart only the supervised child on macOS or Linux

```bash
LIVE="$HOME/.awtsmoos-tunnel"
kill "$(cat "$LIVE/agent.pid")"
```

The supervisor starts one replacement child without reinstalling files. Use the forced installer restart when the supervisor itself is missing or unhealthy.

## Check the installed feature set

```bash
LIVE="$HOME/.awtsmoos-tunnel"
cat "$LIVE/install-state.txt"
test -f "$LIVE/scripts/recovery-control.cjs" \
	&& echo 'Recovery controls available' \
	|| echo 'Recovery controls not installed; refresh the tunnel first'
```

The tier, integrity, and offline-restore commands below require a recovery-enabled build. Older installed builds can still be refreshed and restarted with the installer commands above.

## Inspect recovery-enabled health

```bash
LIVE="$HOME/.awtsmoos-tunnel"
node "$LIVE/scripts/recovery-control.cjs" status "$LIVE"
node "$LIVE/scripts/recovery-control.cjs" check "$LIVE"
cat "$LIVE/recovery-state.json"
```

A healthy recovery-enabled runtime reports a valid manifest, a valid executable seal, and an active recovery level.

## Concurrency and fallback levels

Logical command admission is unlimited by default. Physical subprocess execution is bounded by the selected recovery level.

| Level | Mode | Physical workers |
|---|---|---:|
| 0 | Emergency | 1 |
| 1 | Single | 1 |
| 2 | Dual | 2 |
| 3 | Four | 4 |
| 4 | Eight | 8 |
| 5 | Production | Adaptive to machine capacity |

Select a level and restart the supervised child:

```bash
LIVE="$HOME/.awtsmoos-tunnel"
node "$LIVE/scripts/recovery-control.cjs" set-tier "$LIVE" 2
kill "$(cat "$LIVE/agent.pid")"
```

Return to Level 5:

```bash
node "$LIVE/scripts/recovery-control.cjs" set-tier "$LIVE" 5
kill "$(cat "$LIVE/agent.pid")"
```

Three rapid nonzero crashes automatically lower the active level by one. Level 0 remains the final one-worker fallback.

## Offline restoration

Validated recovery packages normally live beside a recovery-enabled runtime:

```text
~/.awtsmoos-tunnel-recovery/tiers/level-0
...
~/.awtsmoos-tunnel-recovery/tiers/level-5
```

Restore a selected level:

```bash
LIVE="$HOME/.awtsmoos-tunnel"
RECOVERY="$HOME/.awtsmoos-tunnel-recovery"
node "$LIVE/scripts/recovery-restore.cjs" "$LIVE" 2 "$RECOVERY"
nohup bash "$LIVE/awtsmoos-supervisor.sh" "$LIVE" \
	>> "$LIVE/agent-supervisor.log" 2>&1 </dev/null &
```

The restore stages and validates the replacement before swapping roots. The existing `config.json` is preserved so the authenticated tunnel identity survives restoration.

## Important runtime files

```text
~/.awtsmoos-tunnel/config.json
~/.awtsmoos-tunnel/install-state.txt
~/.awtsmoos-tunnel/agent.pid
~/.awtsmoos-tunnel/supervisor.pid
~/.awtsmoos-tunnel/agent.log
~/.awtsmoos-tunnel/agent-supervisor.log
```

Recovery-enabled builds may also contain `recovery-state.json`, `recovery.log`, `recovery/`, and `scripts/recovery-*.cjs`.

Do not publish `config.json`, private logs, credentials, OAuth material, or secret-like environment data.
