B"H
Boruch Hashem
Blessed is He

# API Reliability Critique

The Awtsmoos gives every control surface a boundary; Awtsmoos.com must not let safety features become ambiguity engines.

## Twenty improvements

1. Preview responses must never look like execution success.
2. Durable writes must advertise durable execution explicitly.
3. Accepted control requests need `observeWith` metadata.
4. Job responses need `jobIdType:"command_job"`.
5. Control receipts need `receiptType:"control_request"`.
6. Retry responses must preserve original deed identity.
7. Timeout responses must state whether device accepted the deed.
8. Unaccepted timeouts may recommend fresh dispatch.
9. Accepted timeouts must forbid blind redispatch.
10. Readback should be recommended for ambiguous mutation outcomes.
11. logicalAgentId/session defaults should be normalized safely.
12. Missing identity errors should include exact required fields.
13. instructionResolve should advertise its action family.
14. Recovery actions must bypass execution-health quarantine.
15. Cancellation must bypass execution-health quarantine.
16. grep/findFiles/history must keep primary results visible.
17. MissionAnswer must return next question/observation handle.
18. Finalized missions must release exclusive locks.
19. New missions must never inherit stale mission references.
20. Tunnel aliases must resolve to one canonical route reference.

## Restraint

Keep safety defaults. Do not silently convert preview into execution. Do not weaken collision detection. Improve truthfulness and discoverability instead of removing safeguards.
