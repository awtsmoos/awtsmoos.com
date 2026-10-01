# Awtsmoos MCP transition

B"H

## Added tools
- awtsmoos_tunnel_action: existing protected tunnel actions, with action and params.
- awtsmoos_application_catalog: current curated application operations.
- awtsmoos_application_call: existing application gateway; requires awtsmoos.api.
The four previous MCP tools remain available.

## Authentication and permissions
The existing MCP OAuth resource URL and bearer checks remain unchanged.
Mutation uses protectedFs and its existing action scope, ownership, scheduler and audit gates.
Read, write, command, browser, mission and room scopes remain distinct.
Application operations retain their own scope and alias ownership checks.
Resource metadata now advertises mission, room and application scopes.
Existing read-only tokens do not gain write permissions; reconnect/consent for needed scopes.

## Request shape
awtsmoos_tunnel_action arguments:
{"routeReference":"<immutable discovery reference>","action":"read","params":{"p":"/exact/path"}}
Write uses action write and params p/content. Commands use existing commandRun parameters.
Omitting routeReference uses existing authorized automatic device selection.
Reserved credential/action/route carrier parameters cannot override the MCP envelope.
Child handler response metadata is isolated from the outer MCP response.
Do not automatically replay uncertain mutations.

## Verification 2026-10-01
17 focused tests passed: genericTools.test.mjs, appApiGateway.test.cjs, protectedFsAuthorization.test.cjs.
Actual protocol tool listing and actual application catalog succeeded locally.
Syntax and readback checks passed. No authenticated live write or production deployment claimed.
rootMutationPolicy.test.cjs has a separate failing expectation: generated YAML contains rootSelect.
Its policy/schema inputs were unchanged against HEAD during this work.

## Release handoff
Changes are isolated to geelooy/api/tunnel/control/mcp.
Other agents' database edits must not be staged or reset as part of this release.
Use the existing exact-SHA prepare/activation gates after coordinating a clean release tree.
Fix production proxy routing for /.well-known/oauth-protected-resource and oauth-authorization-server:
source routes already exist in geelooy/.well-known/_awtsmoos.derech.js but live URLs returned nginx 404.
Also verify outer router honors requested HTTP 401/403/405 rather than forcing 200.
After deployment, connect OAuth in the existing plugin, discover device, then test a temporary
write/readback/remove round trip and a harmless command with the appropriate scopes.
