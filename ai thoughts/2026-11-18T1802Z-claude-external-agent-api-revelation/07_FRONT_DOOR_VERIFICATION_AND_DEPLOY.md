B"H
Boruch Hashem
Blessed is He

# Front-Door Verification and Exact Deployment

The Awtsmoos showed the Node vessel already knew the hidden road,
yet nginx stood before it and refused the nested load.
Awtsmoos.com now keeps the proxy law beside its tests in tracked light,
while robots opens only public maps and keeps guarded actions out of crawler sight.

## Planned second repair

- Prove whether the path-aware RFC 9728 route fails in application routing or at the public front door.
- Preserve the root metadata alias and existing MCP endpoint.
- Repair the durable tracked nginx source rather than leaving a manual server-only edit.
- Preserve production timeout and temp-path hardening already present in the active nginx snippet.
- Keep broad `/api/` crawling blocked while allowing only five public read-only discovery documents.
- Add focused tests for nginx and robots policy.
- Refuse to sweep unrelated SEO artifacts into the API repair.
- Commit, push, activate the exact SHA, apply the exact nginx snippet, and prove public behavior.

## Actual evidence

- Direct Node request to `127.0.0.1:8080/.well-known/oauth-protected-resource/api/tunnel/control/mcp` returned 200 with the correct MCP resource document.
- Public HTTPS for the same path returned 404 before the second repair.
- Active nginx had exact proxy locations for root Protected Resource Metadata, authorization-server metadata, and MCP, but no path-aware Protected Resource Metadata location.
- Therefore the public 404 is a proven nginx front-door defect, not an application matcher defect.
- Active nginx also had timeout and temp-path hardening absent from the tracked snippet; the tracked source now preserves those production safeguards.
- Public `robots.txt` blocked all `/api/`, matching Claude's earlier `ROBOTS_DISALLOWED` symptom for the public machine documents.

## Source changes in this pass

- `infrastructure/nginx/awtsmoos.com/snippets/oauth-api.conf`
	- Adds exact path-aware Protected Resource Metadata proxy.
	- Preserves active 300-second proxy timeouts and dedicated temp paths.
- `scripts/production/ensure-mcp-oauth-nginx.mjs`
	- Adds the path-aware metadata route to the atomic legacy-site repair helper.
- `infrastructure/nginx/NginxConfigContract.test.mjs`
	- Guards the new route and the production hardening now tracked in source.
- `geelooy/scripts/seo/artifactPlan.mjs`
	- Defines exactly five public machine-discovery crawler exceptions.
- `geelooy/robots.txt`
	- Allows only docs, docs.json, OpenAPI, agent manifest, and bootstrap beneath `/api/`.
	- Keeps broad `/api/` disallowed and does not allow MCP or my-device crawling.
- `geelooy/seo/tests/publicAgentRobots.test.mjs`
	- Guards the narrow crawler policy without depending on unrelated generated sitemap freshness.

## Verification completed before live mutation

- JavaScript syntax checks passed.
- Every touched source/test/config file remains at or below 120 lines.
- `git diff --check` passed.
- Tracked nginx contract test passed.
- Atomic nginx deployment test passed.
- Focused public-agent robots contract passed.
- MCP/OAuth/discovery regression suite passed 54/54.
- Full second-repair source readback completed.
- Exact diff review showed no dirty paths outside this repair and its planning evidence.

## Pre-existing unrelated evidence deliberately excluded

The broad SEO artifact regression currently reports a stale `sitemap.xml`: the existing `artifactPlan.mjs` in HEAD already expected `/@/sitemap.xml` and `/comments/sitemap.xml`, while the committed generated sitemap omitted them. This mismatch predates the Claude/API repair. It is recorded as separate technical debt and is not being silently mixed into this production API commit.

## Remaining deployment sequence

1. Re-check no deployment/import process is active.
2. Stage only the seven second-repair source/test/config artifacts plus planning evidence.
3. Inspect cached names and run cached diff check.
4. Commit and push the exact repair to `origin/main`.
5. Prove local HEAD equals `origin/main` with a clean working tree.
6. Run guarded exact-SHA release activation so production release metadata matches source.
7. Back up the active nginx OAuth/API snippet as a complete file.
8. Replace that snippet with the tracked complete file; never patch it in place.
9. Run `nginx -t`; on failure restore the complete backup.
10. Reload nginx only after validation succeeds.
11. Probe path-aware metadata, root metadata, MCP GET and POST challenges, robots, docs, bootstrap, manifest, and OpenAPI over public HTTPS.
12. Confirm the deployed release SHA and clean Git state.

## Completion boundary

The server side is complete when the advertised path-aware metadata URL is publicly 200, the MCP challenge points to it, Claude-readable public discovery documents are not robots-blocked, guarded action routes remain crawler-blocked, and production reports the exact committed SHA. A Claude-hosted authenticated tool call still requires the human OAuth consent ceremony and must never be fabricated.
