B"H

# Phase 2 — Design Record

## Repair graph

1. Preserve canonical retry identity in the control payload builder.
2. Preserve canonical retry identity in the agent registry and response.
3. Keep pending retry and idempotency records unlimited by default; expire terminal history.
4. Keep command execution finite and fair while logical queue admission is unlimited by default.
5. Add the missing bounded cross-root discovery module.
6. Restore full startup with compatibility guards.
7. Bound the diagnostic text log.
8. Add focused regression tests.
9. Rebuild and verify the installer manifest.

## Files

The control payload builder is split into focused parsing, identity, collection, text, numeric, boolean, action, and scope modules. Runtime files remain below 120 lines where practical.
