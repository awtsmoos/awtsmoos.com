# B"H
## Boruch Hashem — Blessed is He

# Phase Two: Improved Layered Recovery Architecture

## Layer 0 — Observation
Structured status distinguishes transport, supervisor, child, registration, executor, and workspace evidence.

## Layer 1 — Normal guardian
Launchd remains preferred on macOS; portable detached supervisor remains a platform fallback.

## Layer 2 — Staged startup proof
A new small startup-gate module waits for outer service / supervisor birth before agent readiness begins.
At the deadline, it performs a final edge sample to prevent the cleanup/start race observed today.

## Layer 3 — Installer continuity fallback
If replacement still cannot prove health, the installer invokes an emergency-continuity module before returning failure.
The module launches or adopts the sealed Tier-0 slot and requires registration proof.

## Layer 4 — Supervisor self-heal
If the installed supervisor detects repeated modern-child failure, existing emergency runtime logic remains the in-process fallback.
The installer and supervisor therefore converge on the same sealed recovery primitive.

## Layer 5 — Local independent operator repair
Keep `emergency-sealed.sh`, known-good rescue, direct Node launcher, and a new concise `emergency-auto.sh` ladder.
It should work even when `awt`, launchd, or the normal supervisor is absent.

## Layer 6 — Remote independent repair
Expose a stable minimal remote shell bootstrap that:
1. finds Node deterministically,
2. attempts local sealed emergency first,
3. downloads only rescue components if local slot is absent/corrupt,
4. verifies downloaded bytes,
5. launches Tier-0,
6. prints machine-readable next steps.

## Layer 7 — Full repair
Once continuity exists, normal installer can repair/replace the primary runtime without stranding remote access.
