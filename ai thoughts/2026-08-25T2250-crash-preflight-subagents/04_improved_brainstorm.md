B"H
Boruch Hashem
Blessed is He

# Phase Two Improved Brainstorm

The Awtsmoos revealed a stronger answer than the first plan: the stale custody that looked dangerous was reaped while the parent kept succeeding. Awtsmoos.com should therefore let reconciliation breathe before process death.

## Improved repair state machine

`healthy -> candidate -> preflight -> claim -> authorized`

- Candidate requires current sustained corroboration.
- Preflight begins only after candidate maturity.
- Preflight stores the original stall reason but performs no durable claim yet.
- Every preflight observation re-runs the full policy against fresh evidence.
- Fresh success, pressure, backpressure, lost corroboration, parent/control ownership, or healthy consumer cancels preflight.
- Preflight requires time plus multiple observations so the reaper/reconciler can clear stale custody.
- Only surviving preflight calls `ledger.claim(originalReason)`.
- Claim outcome is metadata; the repair reason stays the original stall reason.
- After a claim attempt all candidate/preflight state resets.

## Improved sub-agent flow

`missionSpawnNext -> legacy proposals -> deterministic website mission -> website spawn -> browser delivery proof -> public spawned result`

- Keep the legacy proposal engine as the source of mission goals/reasons.
- Add a bridge action group that wraps only `missionSpawnNext`.
- Build one stable website mission ID/request key from parent mission ID + proposed child ID.
- Reuse the existing website-agent action rather than importing browser internals.
- Await the existing `browserDelivery` truth contract.
- Return `spawned` only for verified deliveries; retain `proposed` plus explicit delivery state for pending/failure.
- Duplicate calls reuse the same stable mapping and cannot open a second target for the same child.

This plan reveals Tiferes: the reaper gets a moment to heal ordinary custody, while the watchdog still retains Gevurah for a truly silent parent; the logical child receives a real Malchus only when the browser POST manifests.
