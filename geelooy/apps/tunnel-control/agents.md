B"H

# Awtsmoos Tunnel Control — AI Agent Instructions

These instructions govern AI agents that operate the Tunnel Control application, action API, or OpenAPI/GPT surfaces.

## Canonical references

- Human docs: <https://awtsmoos.com/api/tunnel/control/docs>
- Machine docs: <https://awtsmoos.com/api/tunnel/control/docs.json>
- OpenAPI: <https://awtsmoos.com/api/tunnel/control/openapi>
- Control panel: <https://awtsmoos.com/apps/tunnel-control/>
- Tunnel runtime guide: [`../tunnel/README.md`](../tunnel/README.md)
- Tunnel AI guide: [`../tunnel/agents.md`](../tunnel/agents.md)

Read the live machine documentation or schema when payload shape is uncertain. Do not infer unsupported parameters from memory.

## Device discovery

1. Authenticate with Awtsmoos.com when necessary.
2. Discover connected tunnels automatically.
3. When exactly one tunnel is connected, use its returned `tunnelName`.
4. When none are connected, instruct the user to start or refresh the agent, then retry discovery.
5. When several are connected, present the returned tunnel names and ask which one to use.
6. Never fabricate a device, tunnel, route, project root, action result, worker, receipt, or job identifier.

## Start, refresh, and restart

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

On Unix, restart only the supervised child when no reinstall is needed:

```bash
LIVE="$HOME/.awtsmoos-tunnel"
kill "$(cat "$LIVE/agent.pid")"
```

The existing `config.json`, tunnel name, and project root must be preserved.

## Capability check

```bash
LIVE="$HOME/.awtsmoos-tunnel"
cat "$LIVE/install-state.txt"
test -f "$LIVE/scripts/recovery-control.cjs" \
	&& echo 'Recovery controls available' \
	|| echo 'Recovery controls unavailable'
```

Never issue tier or offline-restore commands unless the connected installed runtime contains those scripts. If they are absent, use the installer or forced restart, then verify again.

## Action discipline

- Select and verify the intended tunnel before every write or command action.
- Confirm returned project root and route identity when relevant.
- Prefer read-only inspection before writes or commands.
- Do not request secrets without explicit authorization and tunnel permission.
- Never treat browser automation or local HTTP proxy access as an isolated remote sandbox.
- Back up real project files before modification.
- Rewrite complete files instead of fragile partial replacements.
- Verify results from actual files, commands, browser state, and tunnel responses.

## Durable commands and pending responses

A response with `pending: true` means the operation is still alive.

- Do not submit the original command again.
- Preserve the exact `controlRequestId` and returned retry payload.
- Reuse the returned retry carrier exactly as documented by the active schema.
- Once a receipt contains `jobId`, use `commandStatus`, `commandWait`, or `commandJobOutputPage`.
- Keep `workerId`, `receiptId`, `command`, and `cwd` correlated with that job.
- Treat correlation conflicts as evidence to inspect, not a reason to disable validation.

## Recovery-enabled concurrency

Logical command admission is unlimited by default. Physical subprocess execution is controlled by recovery levels:

| Level | Workers |
|---|---:|
| 0 | 1 |
| 1 | 1 |
| 2 | 2 |
| 3 | 4 |
| 4 | 8 |
| 5 | Adaptive production capacity |

Do not describe Level 5 as unbounded process creation. Additional logical work remains queued durably and fairly.

Run only when `scripts/recovery-control.cjs` exists:

```bash
LIVE="$HOME/.awtsmoos-tunnel"
node "$LIVE/scripts/recovery-control.cjs" status "$LIVE"
node "$LIVE/scripts/recovery-control.cjs" check "$LIVE"
node "$LIVE/scripts/recovery-control.cjs" set-tier "$LIVE" 2
kill "$(cat "$LIVE/agent.pid")"
```

Return to Level 5 only after health and a basic command succeed:

```bash
node "$LIVE/scripts/recovery-control.cjs" set-tier "$LIVE" 5
kill "$(cat "$LIVE/agent.pid")"
```

## Offline restoration

Run only when both the restore CLI and selected package exist:

```bash
LIVE="$HOME/.awtsmoos-tunnel"
RECOVERY="$HOME/.awtsmoos-tunnel-recovery"
node "$LIVE/scripts/recovery-restore.cjs" "$LIVE" 2 "$RECOVERY"
nohup bash "$LIVE/awtsmoos-supervisor.sh" "$LIVE" \
	>> "$LIVE/agent-supervisor.log" 2>&1 </dev/null &
```

After restore, verify health, selected level, package checksums, preserved configuration identity, one read action, and one command action. Never edit immutable recovery archives in place.
