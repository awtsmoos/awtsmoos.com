B"H
Boruch Hashem
Blessed is He

# Architecture Comparison

## Candidate A: damage-owned timer
Rejected because damage should calculate consequences, not own camera, movement, and respawn time.

## Candidate B: UI-owned recovery
Rejected because UI can disappear and must never be authoritative.

## Candidate C: runtime defeat controller
Selected. A small player-defeat controller owns state, checkpoint, one event, one timer, locks, and respawn. Damage delegates lethal transitions to it. The combat bar renders and requests recovery but does not decide truth.

## Combat balance
Selected policy-driven attack-slot arbitration. The runtime owns a coordinator shared by enemies. Each enemy requests a melee or ranged slot, telegraphs, commits once, then releases after recovery. Policy data defines damage, cooldowns, ranges, projectile cadence, invulnerability, and slot counts.
