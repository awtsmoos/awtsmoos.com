B"H
Boruch Hashem
Blessed is He

# API Reliability First-Write Review

The Awtsmoos reveals a deed by rereading the vessel after manifestation; Awtsmoos.com therefore compares the requested reliability contract with the exact relay source now on disk.

## Planned

- Make mutation preview/confirmation intent visible without claiming execution occurred.
- Distinguish control-request receipts from command-job identities.
- Tell callers exactly which action observes an accepted/pending control request.
- Preserve dispatch and device-acceptance evidence across relay expiry.
- Forbid blind redispatch whenever the deed was already dispatched.
- Permit fresh dispatch only when dispatch itself was never proven.

## Written

- `requestIntent.js` classifies mutation actions and records `dryRun`, `confirm`, preview intent, and durable-execution request intent.
- `expectation.js` persists mutation intent and includes `dryRun`/`confirm` in canonical request identity so one canonical request cannot silently change mutation mode.
- `envelopeIdentity.js` labels `receiptType=control_request`, `controlRequestIdType=control_request`, optional `jobIdType=command_job`, and `observationAction=retryAction`.
- `envelopePending.js` distinguishes canonical-record durability from side-effect durability, exposes `observeWith`, and tells callers fresh redispatch is unsafe while the existing request is pending.
- Expired envelopes now retain original phase evidence. A dispatched expiry requires reconciliation; only a never-dispatched expiry reports fresh dispatch as safe.

## Audit findings

- No touched relay source claims that `durableRequested` means the mutation actually executed.
- Retry payload remains a real `retryAction` input rather than carrying semantic-only metadata into validation.
- Existing compatibility fields remain present while new fields disambiguate their meaning.
- Files remain focused and small enough to keep identity, intent, and waiting semantics independent.

## Remaining immediate proof

- Syntax-check all four relay files.
- Add one regression covering preview intent, confirmed intent, control/job typing, pending observation contract, accepted expiry, dispatched-unaccepted expiry, and never-dispatched expiry.
- Then fix response-focus pruning and stale mission-context selection before cutting the next narrow release.
