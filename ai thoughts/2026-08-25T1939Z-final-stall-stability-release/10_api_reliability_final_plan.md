B"H
Boruch Hashem
Blessed is He

# API Reliability Final Plan

The Awtsmoos gives every request a truthful lifecycle; Awtsmoos.com must let an agent know exactly what happened and exactly what to do next.

## Files to inspect first

- mutation/write response builders and dry-run gate
- canonical response envelopes and timeout/retry responses
- commandRun/commandStart request lifecycle and job result builders
- compact response-focus/pruning modules
- request identity normalization/validation
- mission lock/finalization/context-selection modules

## Files likely to rewrite

- one small mutation-result truth module plus its caller
- one observation-metadata module shared by pending/timeout/job responses
- response-focus rules for search/history primary payloads
- mission-context selector/finalization lock release helper
- focused tests beside each subsystem

## Required proof

- default preview mutation returns unmistakable non-durable fields
- explicit confirmed mutation returns unmistakable durable fields and survives readback
- accepted control request tells caller to use retryAction, never command job status
- command job receipt identifies itself as a command job
- stale accepted timeout forbids blind redispatch
- unaccepted timeout explicitly permits safe fresh dispatch
- grep/findFiles/history primary result remains visible in compact response
- finalized mission releases its lock and new mission never inherits old mission id
- tunnel remains healthy during concurrent agents and diagnostics

## Release rule

Do not destabilize 1.0.564. Ship a narrow patch only after focused regressions pass. If a fix is not essential to ambiguity/stability, defer it to later polish.
