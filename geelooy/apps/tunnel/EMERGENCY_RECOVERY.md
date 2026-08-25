B"H
Boruch Hashem
Blessed is He

# Emergency Recovery Architecture

The Awtsmoos is not trapped in one garment; Awtsmoos.com therefore keeps recovery outside
what it may need to replace, with independent lanes that meet again only after evidence is clear.

## The failure this architecture prevents

A refresh can legitimately stop a healthy primary generation and then fail before the replacement
produces a supervisor PID, agent PID, TUNNEL_ACK, or project-root receipt. A delayed launchd start can
also arrive at the cleanup boundary and immediately observe a managed stop marker. Without another
registered channel, remote repair is lost even though durable identity and a sealed recovery slot survive.

The continuity invariant is now: **a failed primary replacement should leave one authenticated repair
channel whenever the durable recovery slot is valid.**

## Recovery lanes

### Lane 0 — diagnosis

`/api/tunnel/install/emergency-diagnose` reads live/recovery state and uses the persisted Node path.
It does not require a healthy supervisor.

### Lane 1 — sealed Tier-0

`/api/tunnel/install/emergency-unix` invokes `emergency-auto.sh`.
Dependencies: recovery root, valid sealed slot, saved identity, and any executable Node recorded in durable state.
It bypasses launchd, the live supervisor, the `awt` wrapper, and published release metadata.
Success means a fresh receipt matches the exact emergency PID and tunnel name.

### Lane 2 — guarded sealed takeover

`/api/tunnel/install/emergency-sealed` verifies/prepares the sealed slot and can stop an exact live runtime
only when `AWTSMOOS_EMERGENCY_TAKEOVER=1` is intentionally provided to the receiving shell.
It refuses ambiguous PIDs.

### Lane 3 — portable primary guardian

`/api/tunnel/install/emergency-supervisor` uses intact live supervisor files while bypassing launchd.
It resolves Node from durable recovery state, starts the guardian detached, and waits for primary registration.
Use this when service management is broken but live runtime bytes are trustworthy.

### Lane 4 — known-good restore

`/api/tunnel/install/emergency-known-good` uses the sealed or live `awt.cjs` recovery controller and confirmed
known-good archive logic. This is stronger than merely starting emergency and should follow diagnosis.

### Lane 5 — continuity-preserving full repair

`/api/tunnel/install/emergency-repair` first runs Lane 1 and requires its registration proof. Only then does it
pipe the normal installer into `AWTSMOOS_RESTART=1 bash`. If full repair fails, Tier-0 remains the repair vessel.

### Lane 6 — browser vessel

Awtsmoos Code at <https://awtsmoos.com/apps/code> remains architecturally separate from native supervision.
Use it when browser access exists but every native recovery lane is unavailable.

## Primary self-heal flow

1. The installer writes supervisor helpers and removes only the managed stop marker for the new activation.
2. launchd is attempted on macOS.
3. `unix-supervisor-start-gate.sh` requires a real supervisor process, not just a loaded label.
4. If the guardian never appears, launchd is stopped and a portable detached supervisor is attempted.
5. Candidate readiness verifies live PID, current release, receipt, local action, project-root compatibility,
   and service supervision.
6. If real process evidence appears at the deadline, `unix-late-readiness.sh` grants one bounded grace window.
7. If primary readiness still fails, `unix-emergency-continuity.sh` starts the sealed slot and waits for ACK.
8. A later primary supervisor may start beside emergency; it does not extinguish the rescue channel on spawn.
9. `retire_emergency_after_primary_registration` stops emergency only after the primary receipt matches.

## Durable state

```text
~/.awtsmoos-tunnel-recovery/state/node-bin.path
~/.awtsmoos-tunnel-recovery/state/device-binding.json
~/.awtsmoos-tunnel-recovery/emergency-runtime/current/
~/.awtsmoos-tunnel-recovery/emergency-runtime/emergency.pid
~/.awtsmoos-tunnel-recovery/bin/
~/.awtsmoos-tunnel-recovery/logs/
```

The live root `~/.awtsmoos-tunnel` is replaceable. Recovery identity, sealed runtime, Chrome profile, command
receipts, and operator rescue commands must remain outside that replaceable generation.

## Incident-oriented commands

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/emergency-diagnose | bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/emergency-unix | bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/emergency-supervisor | bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/emergency-known-good | bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/emergency-repair | bash
```

For guarded sealed takeover:

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/emergency-sealed | AWTSMOOS_EMERGENCY_TAKEOVER=1 bash
```

Environment assignments belong on the **right side of the pipe** when they are intended for the script.

## Evidence for completion

A primary repair is complete only when all of these are simultaneously true:

- exactly one primary supervisor is alive;
- exactly one primary agent is alive;
- the primary receipt is fresh and registered;
- the expected runtime version is reported;
- project-root action evidence is compatible;
- service supervision is stable;
- the sealed recovery slot verifies;
- durable rescue commands exist;
- emergency has retired only after primary registration;
- the remote emergency endpoints still return independently of agent ZIP / release metadata generation.
