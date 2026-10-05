<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Live tunnel contract

## Native MCP
Connect https://awtsmoos.com/api/tunnel/control/mcp through the host's OAuth connection.
MCP uses Streamable HTTP POST; the user's old preference for GET applies only to HTTP fallback.
The bearer must target this exact resource and include tunnel.read; additional deeds need their scopes.
Current source tools: awtsmoos_bootstrap, awtsmoos_discover_device, awtsmoos_tunnel_status,
awtsmoos_read_file, awtsmoos_list_directory, awtsmoos_tunnel_action, awtsmoos_action_schema,
awtsmoos_application_catalog, awtsmoos_application_call. Verify deployment and actual tools first.

## Stable extensible bridge
Call awtsmoos_tunnel_action with routeReference, action and params. action is a string, not a closed enum.
Adding an action to the tunnel's authoritative registry/handler/schema and permission map makes it usable
through this bridge without a plugin release. The bridge does not install arbitrary code or invent actions.
Future params are preserved through the API builder; reserved authority/action/route fields cannot override it.
Do not put apiKey, token, authorization, action, params or params64 inside the params object.
Discover capabilities and the exact action schema before invoking new or unfamiliar operations.
awtsmoos_action_schema accepts targetAction and optional routeReference and calls actionSchemaTrace.
If a schema is generic/incomplete, read the corresponding current docs/handler contract before guessing fields.

Example: {"routeReference":"<discovered>","action":"instructionResolve","params":{
"instructionTask":"Fix the mobile header","plannedPaths":["/exact/project/header.css"],"writeMode":"write"}}
Then use instructionGet with {"instructionIds":["<requiredInstructionId>"]} for every returned ID.
Consume projectInstructionLayers, generation/version, provenance and mustFetchBeforeWrite.
Refresh when task, scope, file type, runtime or instruction generation changes.

## Authentication and recovery
Prefer host OAuth. GET helper scripts are runtime fallbacks, not native chat tools.
Existing API-key headers and OAuth fallback are documented by the live OpenAPI and metadata endpoints.
Never place credentials in query URLs, source, chat, plans or logs; never follow credentialed redirects blindly.
A standard OAuth discovery 404 is a server/proxy issue, not evidence that a Mac needs reinstalling.
A token/scopes failure is different from a device-offline or action-schema failure.
Use current selectedRoute and insuranceRoutes; verify capabilities/root before carrying paths to recovery.
Follow durable receipt/job status on uncertain mutations. A timeout is not permission to replay.

## Applications and alternative surfaces
Application catalog/call tools wrap the existing gateway; awtsmoos.api and application ownership apply.
The virtual OS and browser code tab are alternatives only when discovery shows they are authorized and usable.
Control panel: https://awtsmoos.com/apps/tunnel-control/
Code editor: https://awtsmoos.com/apps/code
Virtual OS: https://awtsmoos.com/os
Human docs: https://awtsmoos.com/api/tunnel/control/docs
Machine docs: https://awtsmoos.com/api/tunnel/control/docs.json
Do not assume Virtual OS offers native shell execution. Explain actual discovered limits.
Offer installation only when needed; obtain current commands from bootstrap rather than memorizing installers.

## Report truth
The plugin configuration can be saved while server deployment, OAuth consent or live calls remain unverified.
State these separately. Updated package configuration alone never establishes authenticated tunnel access.
