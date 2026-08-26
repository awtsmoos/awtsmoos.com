B"H
Boruch Hashem
Blessed is He

# API Reliability Brainstorm

The Awtsmoos renews every deed each instant; Awtsmoos.com must make preview, custody, execution, and completion impossible to confuse.

## Targets

- Mutation preview must say `previewOnly:true`, `durable:false`, `executed:false`, and explain the exact durable follow-up.
- Durable mutation must say `previewOnly:false`, `durable:true`, `executed:true`, and include readback/hash evidence when available.
- Accepted requests must expose a canonical observation contract: control request id, transport receipt id, state, and the exact action to call next.
- Command job ids must never be visually or semantically interchangeable with control request ids.
- Request identity should be normalized from stable logical/session context when safely inferable.
- Doctors, cancellation, history, mailbox, scheduler, and generation recovery remain routable when ordinary execution is unhealthy.
- Compact responses must preserve primary semantic results for grep/findFiles/history instead of hiding them behind debug refs.
- Mission finalization must release stale project locks; a new mission may not inherit an old mission id.
- MissionAnswer must return or point to the next question payload deterministically.
- Alias/canonical tunnel names should be returned together with one routeReference chosen by the control plane.

## Fast order

1. Trace mutation preview/result builders.
2. Trace request observation/correlation envelopes.
3. Trace response-focus pruning for search/history.
4. Trace mission lock/finalization context selector.
5. Rewrite small focused modules only.
6. Add focused regressions.
7. Cut next patch release and live-soak.
