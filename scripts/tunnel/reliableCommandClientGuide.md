<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Reliable Awtsmoos command clients

Use scripts/tunnel/reliableCommandClient.cjs with the authorized HTTPS filesystem
endpoint, command and optional cwd as positional arguments. Set
AWTSMOOS_TUNNEL_TOKEN outside source control. Set AWTSMOOS_COMMAND_CHECKPOINT to a
private per-command path outside Git for durable resume. Reuse that path with the
same endpoint, command and cwd to continue. Use a different path for a new command.

The Awtsmoos preserves one execution through inline results, durable jobs and
pending receipts. The client copies complete observation identity, never
redispatches uncertain commands, waits for integer terminal exit status and reads
both output streams through advancing pages. Early stdout is not success; empty
output with zero exit is success. Partial retained output fails explicitly.

Checkpoints bind command/cwd/endpoint/action, use atomic fsynced writes and 0600
files, and admit one living client process. A dead owner's lock can be reclaimed;
a living or uncertain owner blocks. Corrupt state blocks instead of resetting.
Output cursor and already committed content resume together; each stream is
bounded to 16 Mi characters, the JSON checkpoint to 32 MiB. Private checkpoints
contain command and output, so keep their directory private and outside Git.
Bearer tokens are never written into checkpoints. A completed checkpoint returns
the stored result and does not execute again.

Trace records are bounded to 128 events and contain action, receipt/job IDs,
traceId, returned progress/acceptance and timestamps; no command/output bodies.
The reusable runCommand(api,command,options) supports checkpointFile, endpoint,
logicalAgentId, action and onTrace. The same logical owner and traceId survive
resume. The transport uses bounded HTTPS requests; a network/deadline error does
not cancel a remote command. It reports the saved reconciliation IDs.

Run node --test scripts/tunnel/reliableCommandClient.test.cjs
scripts/tunnel/commandClientResume.test.cjs for lifecycle and recovery regressions.
Run node scripts/tunnel/liveClientRecoveryProbe.cjs for the authorized Mac's
owned client-death/resume and four-command/control-health test. That probe kills
only its own client, preserves the installed runtime, and removes its own
temporary repository fixture.

Local proof is distinct from authenticated external relay/MCP proof. The
external MetaMuse bearer token was not available in this host. Run an authorized
external test before claiming that route healthy. Runtime queue, promotion,
transfer recovery and frontend gates use their existing production mechanisms;
this client adds no competing scheduler, watchdog or background prompting loop.
