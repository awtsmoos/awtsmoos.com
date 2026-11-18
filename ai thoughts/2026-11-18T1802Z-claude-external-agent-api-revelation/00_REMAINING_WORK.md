B"H
Boruch Hashem
Blessed is He

# Remaining Work — Claude / External-Agent API Revelation

The Awtsmoos gives the route its light,
contracts become vessels, exact and bright.
At Awtsmoos.com the agent should find the way,
from OAuth to MCP without human relay.

## Mission

Make the public Awtsmoos agent API genuinely usable by Claude-class external clients, with verified discovery, authentication guidance, MCP initialization, device discovery, action-schema discovery, and a harmless real tunnel round trip after human OAuth consent.

## Completed work

- [x] Connected to the live native tunnel and located `/mnt/HC_Volume_102267213/git/awtsmoos.com`.
- [x] Read repository and deploy laws before changing source.
- [x] Confirmed the repository began clean and no competing active mission was exposed.
- [x] Mapped OAuth metadata, Dynamic Client Registration, external-agent handoff, MCP, my-device, bootstrap, manifest, OpenAPI, routing, and tests.
- [x] Verified existing OAuth resource/audience propagation and PKCE protections before modifying anything.
- [x] Confirmed modern remote MCP clients need standards-based protected-resource discovery and Claude can use a public remote MCP URL with OAuth.
- [x] Identified the missing path-aware MCP Protected Resource Metadata route.
- [x] Wrote three planning phases before implementation.
- [x] Added canonical path-aware Protected Resource Metadata while preserving the root alias.
- [x] Added one reusable remote MCP discovery contract.
- [x] Added first-class MCP machine discovery to bootstrap, agent manifest, and OpenAPI enrichment.
- [x] Preserved legacy direct control as a distinct GET-only transport while MCP remains POST Streamable HTTP.
- [x] Preserved OAuth scopes, exact MCP audience enforcement, Dynamic Client Registration, universal handoff client, ChatGPT compatibility, and Grok compatibility.
- [x] Preserved existing WebSocket transfer, GET fallback, recovery, publication, preview, room, and replay-safety guidance after a second write pass.
- [x] Added regression tests for canonical OAuth discovery and additive cross-surface behavior.
- [x] Passed syntax checks for every touched source/test file.
- [x] Passed line-count and tab-indentation gates for every touched source/test file.
- [x] Passed `git diff --check`.
- [x] Passed 54/54 MCP/OAuth/discovery tests.
- [x] Re-read every touched source/test file after the second implementation pass.
- [x] Probed production before deploy and proved it still serves the old contract.

## REMAINING_WORK

- [ ] Re-check branch, configured upstream, remotes, HEAD, and exact dirty paths.
- [ ] Confirm no unrelated dirty work appeared since the clean baseline.
- [ ] Re-check active deploy/import processes immediately before deployment.
- [ ] Stage only this mission's exact paths.
- [ ] Commit the source, tests, and planning evidence.
- [ ] Push the commit to the configured upstream.
- [ ] Prove the remote commit and local clean state before running deployment.
- [ ] Run the documented production deployment path without blind restarts or destructive shortcuts.
- [ ] Verify public path-aware Protected Resource Metadata returns 200 with the MCP resource.
- [ ] Verify unauthenticated MCP GET and POST advertise the canonical path-aware `resource_metadata` challenge.
- [ ] Verify public bootstrap exposes first-class Streamable HTTP MCP POST metadata.
- [ ] Verify public agent manifest exposes version 1.9.0 and the MCP contract.
- [ ] Verify public OpenAPI exposes MCP endpoint and OAuth discovery extensions.
- [ ] Record final public deployment evidence and close server-side remaining work.
- [ ] Leave the interactive Claude OAuth approval as an explicit human consent boundary; never fabricate an authenticated call without that approval.

## Completion gate

Server-side completion requires committed and deployed source plus live public endpoint proof. End-to-end Claude authorization additionally requires the user to approve the OAuth consent flow from Claude or another supported MCP host. Until those boundaries are proven, the mission remains open.
