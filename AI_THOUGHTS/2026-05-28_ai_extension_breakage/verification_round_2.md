B"H

# Verification round 2: user asked "Are you sure keep checking"

## Remaining uncertainty
The static tests prove the page automation callback calls `controller.send(prompt)`, but the strongest possible proof is a dynamic parity test at the controller/service boundary: manual send and automation send should call the same service `promptFunction` with the same option shape except for the unavoidable prompt text and callback function identities.

## Actions now
1. Inspect `ConversationController.send` current body.
2. Add a dynamic harness test that invokes manual-style `controller.send` and automation pipeline send callback, captures service calls, normalizes function fields, and proves parity.
3. Add settings-store tests proving chat A on does not make chat B on.
4. Run focused harness and full suite.
