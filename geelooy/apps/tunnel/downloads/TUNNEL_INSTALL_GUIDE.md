# B"H
# Awtsmoos Tunnel — Installation and Recovery Guide

The native tunnel connects a Mac or Linux machine to an Awtsmoos account. It
provides registered, permission-controlled access for authorized clients.
The public installer is served by Awtsmoos.com from the deployed source release.

## Install from a terminal

For a complete, explicitly requested installation:

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash -s -- --full --yes
```

Headless Linux or rented server with Node.js 18+ already installed:

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash -s -- --agent-only --yes
```

For the interactive menu, omit flags:

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash
```

The explicit `--full`, `--minimal`, and `--agent-only` modes stage and verify a
replacement even if the installed release has the same version. Unattended
recovery without an explicit installation mode may use a faster, verified
same-release repair. An interactive choice also requests a replacement.

The normal replacement sequence is:

1. Validate the installer component archive, Node runtime, and release hash.
2. Stage the candidate beside the existing installation; retain the predecessor
   for rollback and keep its identity metadata protected.
3. Create a **fresh device pairing** and show its approval code and secure URL.
4. Wait for approval from the correct signed-in account; consume and provision
   the scoped credential without printing the credential itself.
5. Prove candidate process, local action, and version in an isolated probe.
6. Atomically switch runtimes, then prove live relay registration and supervisor
   custody. An isolated probe is **not** live relay registration.
7. After verified success, retire recognized older local tunnel generations.

If installation fails during preparation or verification, it does not intentionally
remove the prior working runtime. If a promoted agent cannot register, rollback
restores the predecessor's durable identity metadata **before** restarting it.

## Installation options

| Option | Behavior |
| --- | --- |
| `--full` | Complete native agent, guardian and recovery lanes, with browser support |
| `--minimal` | Native agent and registration; system Node.js 18+; no automatic browser open |
| `--agent-only` | Headless native agent; system Node.js 18+; no browser or full recovery-lane set |
| `--yes` / `-y` | Skip the interactive mode selector; does **not** skip pairing |
| `--no-login` | Skip the separate optional headless device-login step; does **not** bypass secure device pairing |
| `--keep-old-tunnels` | Retain displaced local runtimes; still create a fresh approved identity by default |
| `--reuse-identity` | Explicitly try the existing credential instead of requesting new pairing; fails if that credential is revoked |
| `--clean` | Destructive installer-state reset; **not** required for ordinary reinstall or rejected credentials |
| `--help` | Print built-in usage and available options |

To keep older installations while pairing the new one:

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash -s -- --full --yes --keep-old-tunnels
```

For a trusted unattended upgrade that intentionally reuses an existing valid
credential (and might fail if it was revoked):

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash -s -- --full --yes --reuse-identity
```

**The flags are independent.** `--keep-old-tunnels` retains older installation
files; only `--reuse-identity` reuses older authorization. Do not use
`--reuse-identity` to repair an `invalid_device_credential` rejection.

## Approve the device on your phone

The installer prints a code and a direct approval URL such as:

```text
AWTSMOOS / SECURE DEVICE PAIRING
Code: XXXXX-XXXXX
Approval: https://awtsmoos.com/api/tunnel/control/pairing/page
Status: awaiting account approval
```

The example code is illustrative, not a real credential. Open the complete
approval link printed in your terminal, sign in to the account that should own
the device, confirm the code, and approve only your own machine. The terminal
polls the approval state and then proceeds without a second SSH session.
The exact expiry is provided by the server and displayed by the installer.

A code not yet approved is different from an expired, rejected, or unknown
pairing. If you are signed out, the approval page should direct you to sign in,
not incorrectly call the code expired. A failed or skipped approval must **not**
be reported as a registered tunnel.

Local identity metadata lives in guarded runtime/recovery state. Native secure
credentials are held in the platform's secure-store implementation, not in a
universally readable `credentials.json`. Never paste private keys, request
secrets, keychain contents, or the credential itself into support messages.

## Read the installer's diagnostics

The terminal uses compact, color-safe cards designed to fit a narrow Termux
or SSH display. Candidate readiness reports elapsed and remaining time plus
these independent checks:

- `process`: the candidate executable remains alive.
- `isolation`: the candidate uses the deliberately isolated pre-promotion lane.
- `API`: a real local filesystem action completed.
- `version`: the runtime reports the intended verified release.

**Only after promotion** can live relay registration be proved. The terminal
should identify the failing check rather than showing a motionless 69% line.
Run a harmless real tunnel command afterward: a process-alive check or HTTP
200 alone does not prove that command execution works.

## Troubleshooting

### `invalid_device_credential`

The previous device credential was rejected by the server. Rerun a normal
explicit `--full --yes` installation **without** `--reuse-identity` and approve
the new device on your phone. Do not remove files or credentials by hand.

### Paired candidate fails after promotion

The installer should stop the candidate, restore the previous installation
and its saved identity, and verify that predecessor's registration. Capture
the displayed failing readiness lane and install log path. Never delete the
recovery directory just to silence an error.

### Code appears unknown or expired immediately

Open the **exact** link printed by the installer while signed in as the correct
owner. If its server-side state is actually expired or rejected, rerun for a
fresh code. A signed-out error is not proof that a pairing expired.

### Waiting at candidate probe

The installer prints updated timing and readiness evidence. `process:1` and
`API:1` without real registration do not mean the new tunnel is live. During
an isolated pre-promotion probe, actual registration is intentionally deferred.
A terminal timeout should name the failing lane and preserve the predecessor.

### Verify the final machine

When installed locally, `http://127.0.0.1:3977/readyz` may report registration
and relay state. It does **not** prove a command executed; send an actual
harmless command through an authorized tunnel client and check stdout and exit
code before calling it fully operational.

### Old traces and authorizations

Successful cleanup removes recognized, user-owned older local runtime roots and
services. `--keep-old-tunnels` suppresses that cleanup. **Deleting local files
is not the same as revoking a server-side device binding.** Separate server
revocation and detection of installations under arbitrary custom directories
must be verified independently; do not claim universal eradication.

## API and agent access

For the current native control actions and external-agent invitation interface,
consult [TUNNEL_API_REFERENCE.md](TUNNEL_API_REFERENCE.md) and the live
`/api/tunnel/control/docs.json` discovery endpoint. Discover your current
authorized route rather than routing by a guessed friendly tunnel name.
