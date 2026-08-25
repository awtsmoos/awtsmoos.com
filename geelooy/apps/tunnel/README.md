B"H
Boruch Hashem
Blessed is He

# Awtsmoos Tunnel — Operations and Emergency Index

The Awtsmoos renews every instant; Awtsmoos.com keeps more than one vessel for repair,
so a broken supervisor, installer, PATH, or release lookup does not leave a machine nowhere.

## AI / operator emergency index — start here

When native control disappears, do **not** begin by deleting state or repeatedly reinstalling.
Use the smallest independent lane that can restore authenticated remote custody.

| Need | One-line remote command |
|---|---|
| Diagnose without changing state | `curl -fsSL https://awtsmoos.com/api/tunnel/install/emergency-diagnose \| bash` |
| Start sealed Tier-0 recovery | `curl -fsSL https://awtsmoos.com/api/tunnel/install/emergency-unix \| bash` |
| Start primary runtime without launchd | `curl -fsSL https://awtsmoos.com/api/tunnel/install/emergency-supervisor \| bash` |
| Restore a verified known-good generation | `curl -fsSL https://awtsmoos.com/api/tunnel/install/emergency-known-good \| bash` |
| Preserve Tier-0, then fully repair primary | `curl -fsSL https://awtsmoos.com/api/tunnel/install/emergency-repair \| bash` |

The emergency endpoints are plain shell scripts served independently from published release metadata.
`emergency-unix` uses the durable sealed slot and persisted Node path; it requires fresh TUNNEL_ACK before success.
`emergency-supervisor` bypasses launchd and requires primary registration before success.

## Durable local rescue commands

After a successful recovery-aware install, these survive outside the replaceable live runtime:

```text
~/.awtsmoos-tunnel-recovery/bin/awtsmoos-emergency-auto
~/.awtsmoos-tunnel-recovery/bin/awtsmoos-emergency-sealed
~/.awtsmoos-tunnel-recovery/bin/awtsmoos-emergency-supervisor
~/.awtsmoos-tunnel-recovery/bin/awtsmoos-emergency-known-good
~/.awtsmoos-tunnel-recovery/bin/awtsmoos-emergency-diagnose
~/.awtsmoos-tunnel-recovery/bin/awtsmoos-emergency-repair
```

These commands resolve Node from `~/.awtsmoos-tunnel-recovery/state/node-bin.path`; interactive `PATH` is not required.

## Decision tree

1. Run `emergency-diagnose` when the failure shape is unknown.
2. If the live supervisor is absent, launch `emergency-unix` first to regain Tier-0 remote custody.
3. If the live runtime files are intact but launchd is broken, `emergency-supervisor` can raise the primary guardian portably.
4. If the live generation is corrupt, use `emergency-known-good` only after reviewing diagnosis evidence.
5. For a complete refresh, use `emergency-repair`; it proves Tier-0 continuity before invoking the full installer.
6. Retire emergency only after the primary child has a fresh registered receipt.

See [EMERGENCY_RECOVERY.md](EMERGENCY_RECOVERY.md) for failure semantics and dependencies.

## Normal install and refresh

macOS / Linux:

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash
```

Explicit refresh must set the variable on the **installer shell**:

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | AWTSMOOS_RESTART=1 bash
```

Windows PowerShell:

```powershell
irm https://awtsmoos.com/api/tunnel/install/windows | iex
```

Do not write `AWTSMOOS_RESTART=1curl ...`; that is a different shell token and fails.
Do not use `AWTSMOOS_RESTART=1 curl ... | bash`; that assigns the variable to `curl`, not to the receiving `bash`.

## Self-heal invariants

- A launchd label is not startup proof; an actual supervisor PID must appear.
- If launchd loads but no supervisor appears, startup falls back to a detached portable guardian.
- Candidate readiness gets a bounded late-process grace before cleanup can race a delayed supervisor.
- Failed primary replacement attempts establish sealed Tier-0 continuity before returning failure.
- Emergency stays alive while a new primary child is only starting.
- Emergency is retired automatically only after the primary receipt proves server registration.
- Emergency Tier-0 uses one active command worker and disables self-update / mission boot resume.

## Existing supervised recovery

If the normal `awt` wrapper exists and its supervisor is already healthy:

```bash
~/.awtsmoos-tunnel/awt status
~/.awtsmoos-tunnel/awt check
~/.awtsmoos-tunnel/awt rescue
~/.awtsmoos-tunnel/awt normal
```

Confirmed offline restore remains stronger:

```bash
~/.awtsmoos-tunnel/awt restore 0 --confirm
```

Use the independent emergency lanes above when `awt`, launchd, the supervisor, or shell Node discovery is unavailable.

## Control surfaces

- Control panel: <https://awtsmoos.com/apps/tunnel-control/>
- Human action docs: <https://awtsmoos.com/api/tunnel/control/docs>
- Machine docs: <https://awtsmoos.com/api/tunnel/control/docs.json>
- OpenAPI: <https://awtsmoos.com/api/tunnel/control/openapi>
- Browser/code fallback: <https://awtsmoos.com/apps/code>

Never publish `config.json`, device binding, credentials, OAuth material, or private logs.
