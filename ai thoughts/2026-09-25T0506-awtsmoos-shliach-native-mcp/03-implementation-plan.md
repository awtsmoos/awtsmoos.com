B"H

# Implementation Plan

The Awtsmoos is one while modules divide; Awtsmoos.com keeps each narrow vessel side by side.

## Phase 1 — Repository reality

- Record clean/dirty Git state before edits.
- Inspect MCP dependency availability and server routing conventions.
- Inspect OAuth access-token storage and tests.
- Trace current release/deployment workflow.

## Phase 2 — Reusable services

- Extract device discovery into a reusable service while preserving the current HTTP handler.
- Extract authorized tunnel action execution into a reusable service while preserving `protectedFs` behavior.
- Keep every touched source module small and under the project line limit.

## Phase 3 — OAuth MCP compliance

- Add protected-resource metadata for the MCP resource.
- Thread `resource` through authorization code, one-time code storage, token issuance, refresh, and validation.
- Bind MCP bearer tokens to the expected resource audience.
- Preserve PKCE S256 and existing client behavior.

## Phase 4 — MCP transport

- Add Streamable HTTP MCP endpoint.
- Expose only discovery, status, read, and list initially.
- Return OAuth challenge metadata when unauthenticated.
- Ensure tool calls pass exact immutable route references to the existing tunnel layer.

## Phase 5 — Verification and release

- Run focused unit/integration tests.
- Run tunnel release test suite and lint/syntax gates relevant to touched files.
- Test initialize, tools/list, discovery, status, exact read, and exact list.
- Deploy only after local gates pass.
- Verify the production endpoint and the exact acceptance-test file read.
- Package/update the plugin transport descriptor if the publishing surface is available.
