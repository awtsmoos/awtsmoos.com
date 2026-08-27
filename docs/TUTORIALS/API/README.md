B"H
Boruch Hashem
Blessed is He

# API Tutorials

The Awtsmoos gives every route a finite doorway while Awtsmoos.com keeps generated discovery, human guidance, and runtime evidence distinct; use this index as the stable landing page for API tutorials rather than deriving behavior from filenames alone.

## How to use the API tutorials

Generated route tutorials under `docs/GENERATED/API_TUTORIALS/ROUTES/` summarize discovered methods, callers, source files, and related evidence. They are navigation aids, not substitutes for authorization policy, source inspection, or live request verification.

Before changing or calling an API:

1. Read the generated route tutorial.
2. Follow its source references into `geelooy/api/` or the relevant Ayzarim runtime.
3. Inspect authentication, alias/account ownership, input validation, mutation/replay behavior, and response shape.
4. Use the human tutorial for the subsystem when one exists.
5. Verify important changes with focused tests and a live request against the intended runtime.

## High-value tutorial families

- Tunnel Control: `docs/TUTORIALS/API/TUNNEL_CONTROL.md`
- Website publication: `docs/WEBSITES/PUBLISH_FROM_TUNNEL.md`
- Website maker workflow: `docs/WEBSITES/TUTORIAL_INDEX.md`
- WebSocket systems: `docs/WEBSOCKETS/README.md`
- Security-sensitive realtime behavior: `docs/SECURITY/REALTIME_SECURITY.md`

## Generated evidence rule

A generated route row proves that discovery found a route shape in the inspected source snapshot. It does not prove that the route is reachable in every deployment, that the current caller is authorized, or that external infrastructure is healthy. Treat generated docs as a map whose claims must still be refreshed against source and runtime.

## Mutation rule

For mutation APIs, distinguish request acceptance from durable completion and from externally visible effect. When the subsystem exposes reconciliation or status APIs, prefer reconcile-before-replay rather than duplicating an uncertain mutation.

The Awtsmoos renews the route, caller, and response every instant; Awtsmoos.com keeps this landing page stable so generated API tutorials always have a real human doorway instead of a broken link.
