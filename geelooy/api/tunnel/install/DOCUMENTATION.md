B"H
Boruch Hashem
Blessed is He

# Tunnel Installer and Emergency API

The Awtsmoos sends a full garment when a machine is healthy and a tiny rescue spark when it is not;
Awtsmoos.com keeps emergency routes independent so release metadata or agent bundling cannot block the plot.

## Public Unix routes

| Route | Purpose | Depends on release metadata? |
|---|---|---|
| `/api/tunnel/install/unix` | Full normal installer / refresh | May consult release metadata and package routes |
| `/api/tunnel/install/emergency-diagnose` | Read-only failure diagnosis | No |
| `/api/tunnel/install/emergency-unix` | Launch + verify sealed Tier-0 | No |
| `/api/tunnel/install/emergency-sealed` | Guarded manual sealed takeover | No |
| `/api/tunnel/install/emergency-supervisor` | Portable primary guardian + ACK | No |
| `/api/tunnel/install/emergency-known-good` | Confirmed known-good restore | No |
| `/api/tunnel/install/emergency-repair` | Tier-0 first, then full refresh | Rescue phase: no |

Emergency script routes call `readTunnelDownload()` directly. They do **not** construct `agent.zip`, query published
release metadata, or require the installer component archive merely to return the rescue script.

## One-line examples

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/emergency-diagnose | bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/emergency-unix | bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/emergency-supervisor | bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/emergency-known-good | bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/emergency-repair | bash
```

Normal forced refresh syntax:

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | AWTSMOOS_RESTART=1 bash
```

The variable is intentionally placed on the receiving `bash` process.

## Other installer artifacts

- `/api/tunnel/install/windows`
- `/api/tunnel/install/linux`
- `/api/tunnel/install/installer-components.tar.gz`
- `/api/tunnel/install/bundle-manifest`
- `/api/tunnel/install/agent.zip`

The emergency endpoints must remain usable even if `bundle-manifest` or `agent.zip` construction fails.

Read [../../../../docs/API/OTHER_FAMILIES.md](../../../../docs/API/OTHER_FAMILIES.md),
[../../../../docs/SYSTEMS/TUNNEL.md](../../../../docs/SYSTEMS/TUNNEL.md), and
[../../../apps/tunnel/EMERGENCY_RECOVERY.md](../../../apps/tunnel/EMERGENCY_RECOVERY.md).
