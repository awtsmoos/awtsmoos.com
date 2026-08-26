B"H
Boruch Hashem
Blessed is He

# API Reliability Final Review

The Awtsmoos keeps every deed truthful from intention through custody to completion; Awtsmoos.com now carries that truth without rewriting native evidence.

## Original request-derived problems addressed

- Control request IDs were easy to confuse with command-job IDs.
- Accepted/pending relay outcomes did not say which observation action was valid.
- Expired envelopes could erase stronger dispatch/acceptance evidence and imply unsafe fresh redispatch.
- Mutation dry-run/confirm intent disappeared from durable request identity and observer semantics.
- Successful-looking preview results could be mistaken for durable filesystem mutation.
- Late native completion needed the same semantic presentation as fresh completion without mutating historical timeout/native records.

## Final implementation

- `requestIntent.js`: mutation intent classifier; never claims execution.
- `expectation.js`: persists dryRun/confirm intent and makes it part of canonical request identity.
- `envelopeIdentity.js`: labels control-request receipts, optional command-job IDs, and the valid observation action.
- `envelopePending.js`: preserves phase evidence; dispatched expiry forbids blind redispatch; never-dispatched expiry explicitly permits a fresh dispatch.
- `terminalPresentation.js`: decorates only caller-facing terminal copies with request semantics and bounded side-effect proof language.
- `lifecycleFinalization.js`: persists raw native terminal evidence first, then presents a decorated copy to waiters.
- `durableRecordResult.js`: replay and late-terminal promotion receive the same presentation while raw durable records remain unchanged.
- `envelopeObservationSemantics.test.cjs`: encodes the external-agent mistakes as permanent regressions.

## Verification completed

- Expanded relay semantics regression: exit 0.
- Existing late-terminal exactly-once regression: pass 1, fail 0.
- Explicit `node --check`: all 8 changed JS/CJS files clean.
- Final source reread: lifecycle finalization, effective result, and expanded test match intended architecture.
- Live tunnel under tests: circuit closed, consumer healthy, no false repair; active pressure correctly vetoed repair.

## Not falsely claimed fixed

- `responseFocus/debugRef/simple_response_default` compaction markers are not present in the shipped native-agent or dynamic-server source searches performed here; evidence points to an outer gateway layer.
- Project-wide stale mission orchestration strings likewise are not present in the inspected mission core/native source; mission storage/finalization itself correctly marks terminal state. Do not pretend this outer-layer issue is fixed by the relay hotfix.

## Deployment scope

Publish only `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay` on top of current public main, then fast-forward the production server and restart `awtsmoos.service`. Do not restart the healthy Mac 1.0.564 agent for a server-only relay presentation/correctness patch.
