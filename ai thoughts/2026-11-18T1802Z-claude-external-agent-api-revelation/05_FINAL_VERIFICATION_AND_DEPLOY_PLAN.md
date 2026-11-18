B"H
Boruch Hashem
Blessed is He

# Final Verification and Deploy Plan

The Awtsmoos reveals the contract, then asks that proof descend to the street;
Awtsmoos.com is not repaired merely because local source and passing tests are sweet.
The public gate must answer with the newer truth before this mission may close;
so commit, deploy, and live verification are the final vessels the project owes.

## Original plan versus actual second pass

### Planned

- Add path-aware RFC 9728 Protected Resource Metadata for the MCP endpoint.
- Preserve the legacy root protected-resource metadata alias.
- Keep exact MCP audience and scope enforcement unchanged.
- Make remote Streamable HTTP MCP discoverable in bootstrap, manifest, and OpenAPI.
- Keep legacy direct control GET-only and clearly separate from MCP POST.
- Preserve Dynamic Client Registration and the universal external-agent handoff client.
- Preserve all existing ChatGPT, Grok, WebSocket, transfer, recovery, publication, and room behavior.
- Keep every touched source/test file at or below 120 lines with tab indentation.
- Verify syntax, focused regressions, broad MCP/OAuth regressions, full readback, and public HTTPS behavior.

### Actual

- Implemented canonical path-aware metadata at `/.well-known/oauth-protected-resource/api/tunnel/control/mcp`.
- Kept the legacy root metadata route as an alias to the same MCP resource document.
- Changed no OAuth token grant, audience validation, or scope-enforcement logic.
- Added one reusable `mcp/discoveryContract.js` consumed by bootstrap, manifest, and OpenAPI enrichment.
- Split manifest/bootstrap/OpenAPI responsibilities into small modules rather than compressing old guidance.
- Restored every older machine-guidance contract that the first implementation pass had accidentally shortened.
- Added regression tests that explicitly protect those restored contracts.
- Re-read every touched source/test file after the second implementation pass.

## Verification evidence

- `node --check`: passed for every touched source/test file.
- Touched code/test files: all at or below 120 lines.
- Leading-space indentation scan: no violations found.
- `git diff --check`: clean.
- MCP/OAuth/discovery regression suite: 54 tests passed, 0 failed.
- Full source/test readback: complete after the second implementation pass.
- Public pre-deploy probe: production still serves the old contract, proving source changes have not yet been deployed.

## Remaining deployment graph

1. Re-check Git branch, upstream, remote, and exact dirty paths.
2. Confirm no unrelated dirty files appeared after the initial clean baseline.
3. Re-check active deployment/import processes immediately before deployment.
4. Stage only this mission's exact files; never use broad `git add .`.
5. Commit the complete repair and planning evidence.
6. Push the current branch to its configured upstream.
7. Confirm the pushed commit exists remotely and the working tree is clean.
8. Run the repository's documented production deploy path only after that proof.
9. Probe the public path-aware metadata endpoint until it returns the MCP resource document.
10. Probe unauthenticated MCP GET and POST until both challenge with the canonical path-aware `resource_metadata` URL.
11. Probe bootstrap and manifest until the first-class `mcp` contract and manifest version 1.9.0 are visible.
12. Probe OpenAPI until its MCP extension metadata is visible.
13. Record the live deployment evidence and remaining human OAuth step.

## Completion boundary

The server-side repair may be declared deployed only after the public HTTPS probes prove the new contract. A fully authenticated Claude tool call still requires the user to approve OAuth in Claude or another authorized MCP host; that interactive consent must never be bypassed or fabricated.
