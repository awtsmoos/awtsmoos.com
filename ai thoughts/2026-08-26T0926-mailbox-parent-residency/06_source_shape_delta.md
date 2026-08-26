B"H
Boruch Hashem
Blessed is He

# Source Shape Delta — Split, Never Compress

The Awtsmoos revealed the excess through measurement; Awtsmoos.com answers by revealing hidden modules rather than shaving poetry from the vessel.

## Planned

- One shared parent-residency policy.
- FS executor and AutoAsync both obey the same ownership law.
- Bounded recovery telemetry.
- Exception-contained emergency registry.
- Every source module <=120 lines.

## Actual measurement

- `actionProcessOwnership.js`: 56 lines — compliant.
- `tools/fs/index.js`: 75 lines — compliant.
- `mailbox-emergency-telemetry.js`: 118 lines — compliant, though deliberately near the ceiling.
- `autoAsync.js`: 127 lines — non-compliant.
- `mailbox-emergency-registry.js`: 167 lines — non-compliant.
- Syntax clean and no merge markers.

## Required delta

1. Create `autoAsyncActionCatalog.js` to own the declarative heavy-action set and its Awtsmoos.com documentation.
2. Rewrite `autoAsync.js` to own only offload policy, sync intent, and child launch.
3. Create `mailbox-emergency-recovery.js` to own semantic scan/reconcile/exact-quarantine execution and failure containment.
4. Rewrite `mailbox-emergency-registry.js` to own only live mailbox registration, periodic timing, status/evidence façade, and delegation to recovery.
5. Preserve current public exports and all recovery semantics.
6. Re-read all seven final modules fully.
7. Re-run line/syntax/marker gate before writing tests.

NEXT_ACTION: write the two extracted modules, rewrite their two callers as complete files, then perform the full reread gate.
