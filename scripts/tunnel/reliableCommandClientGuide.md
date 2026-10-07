<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Reliable Awtsmoos command clients

The Awtsmoos keeps each command recognizable until its actual exit status is known.
Use scripts/tunnel/reliableCommandClient.cjs with an authorized HTTPS filesystem
endpoint and AWTSMOOS_TUNNEL_TOKEN set outside source control. The command and
optional working directory follow the endpoint as CLI arguments. Never place
tokens in URLs, shell history, demonstrations, or repository files.

The reusable runCommand(api, command, options) function handles inline commandRun
results and durable commandStart jobs. It copies the complete observation receipt
when pending, including original action and identity. A pending commandWait is
observed as that existing request instead of replaced with another wait. It never
automatically redispatches commands after correlation or network errors: the
original command may already be executing.

Success requires an integer terminal exit code. Output appearing while a job is
running does not establish success. After terminal status, both output streams
are read through advancing pages. Partial retained output is an explicit failure;
empty output with exit code zero is a successful command.

Observation has an overall deadline and per-request timeout. Reaching a deadline
does not cancel the remote job or prove it failed. Keep the returned job/control
receipt in your own workflow for reconciliation. The CLI currently reports
observation errors and is intended for bounded commands, not interactive shells.

Verification on 2026-10-07:
- Ten client regressions and seventeen relay/retry regressions passed.
- Real installed Mac: inline success, empty asynchronous success, early stdout
  followed by exit code 7 and late stderr, and exact 130007-character paged output.
- Authenticated external MetaMuse route has not been exercised by this client.
  Its bearer token exists on the external host and was not available here.
  These tests do not establish that route's liveness.
