B"H

# 03 — Critique: Forty Ways a Trusted Publication Bridge Could Still Be Wrong

Boruch Hashem. Blessed is He.

The Awtsmoos creates authority and action anew. Before code, this bridge must be attacked from every direction so convenience cannot smuggle identity, publication, or deployment assumptions across the boundary.

1. Do not trust `payload.userId`.
2. Do not trust `payload.actorUserId`.
3. Do not trust `payload.$i`.
4. Do not trust `payload.services`.
5. Do not trust `payload.credentialId` as a substitute for the authenticated hosted user.
6. The runtime actor must be the trusted `userId` argument supplied by the outer hosted dispatcher.
7. The runtime server/database vessel must be the trusted `$i` argument supplied by the outer hosted dispatcher.
8. The Tunnel action must be explicitly classified as `tunnel.write`; unknown-action read fallback is not sufficient.
9. Do not call canonical publication from ordinary `write`, `mkdir`, or AI-output writes.
10. Publishing must remain an explicit action.
11. Do not loop HTTP back into `awtsmoos.com` when the existing Drive service can be called directly.
12. Do not scrape cookies or browser session state.
13. Do not expose API keys or bearer credentials in action payloads.
14. Do not bypass Drive alias ownership policy.
15. Do not duplicate site mapping policy in Tunnel code.
16. Do not duplicate project config policy in Tunnel code.
17. Do not duplicate source manifest validation in Tunnel code.
18. Do not manually write public Drive paths from the bridge.
19. Do not directly write site-mapping DB records from the bridge.
20. Do not turn a successful bootstrap receipt into `canonicalVerifiedLive:true`.
21. Do not claim TLS/custom-domain readiness from source publication.
22. Do not treat `/sites/<alias>/<siteId>/` shape alone as proof of publication.
23. Do not accept arbitrary filesystem paths as site roots without existing Drive normalization.
24. Do not allow `.awtsmoos/*` metadata through by weakening manifest policy.
25. Do not invent a second project schema.
26. Do not expose arbitrary runtime or shell configuration in this action.
27. Do not accept registrar/DNS credentials.
28. Do not silently auto-enable dynamic runtime.
29. Do not make custom-domain activation part of source publication.
30. Do not make publication retryable by default at the Tunnel transport layer.
31. If a mutation becomes ambiguous after acceptance, do not blindly replay it.
32. Preserve the standard bootstrap receipt so reconciliation can inspect existing site/project state later.
33. Do not change existing recovery action behavior.
34. Do not change ordinary `dispatchOsFs` fallback semantics.
35. Do not overload `actionNames.js` for unrelated publication verbs; use a dedicated action-name module.
36. Do not put business logic directly into `hostedVirtualOs/dispatcher.js`.
37. Do not let `hostedVirtualOs/dispatcher.js` exceed 120 lines after the rewrite.
38. Do not let `scope.js` exceed 120 lines or lose any existing scope classifications.
39. Do not partially patch either tracked file; full-file rewrite only after fresh read.
40. Do not write tests before implementation source is finished.
41. Do not use one-line compressed functions to satisfy line limits.
42. Do not weaken B"H/Awtsmoos documentation to save lines.
43. Do not expose internal dependency injection through the action payload.
44. Dependency injection for tests must be a trusted function argument or module composition only.
45. Do not let a fake bootstrap dependency obscure whether trusted `$i/userId` are forwarded correctly.
46. The unit test must deliberately supply malicious payload identity fields and prove they are ignored.
47. The unit test must prove the returned bootstrap result is preserved rather than reinterpreted.
48. The routing test must prove non-publication actions still fall through unchanged.
49. The routing test must prove recovery actions retain priority over ordinary fallback.
50. The scope test must prove `sitePublishBootstrap` requires write authority.
51. The scope test must prove unknown actions still default to read.
52. Existing scope classifications for preview, runtime, command, AI, writes, and reads must remain intact.
53. Do not deploy local changes merely because unit tests pass.
54. Production currently demonstrates old Virtual-OS URL receipt behavior, proving local and deployed code differ.
55. Before any deployment, inspect the guarded release workflow rather than using release activation as a diagnostic tool.
56. Do not call `npm run bh` blindly; it is a guarded release workflow.
57. If deployment is eventually chosen, verify exact commit/file composition first.
58. Do not publish Bounce in production until the new action is actually deployed and discoverable.
59. Do not assume a locally callable action exists in production before verifying action scope/availability there.
60. Do not publish a stale Bounce manifest; reread actual hosted bytes or use a trusted hosted manifest collector immediately before mutation.
61. The previously read 25-file Bounce manifest is evidence of current source at that time, not an eternal cache.
62. Do not include README by accident.
63. Do not include `.awtsmoos` metadata by accident.
64. Do not mark canonical live until external expected-content verification sees the expected site title and functioning assets.
65. Do not confuse canonical Awtsmoos publication with custom-domain attachment.
66. Do not confuse source preview with canonical publication.
67. Do not let external verification mutate publication state automatically.
68. Preserve all pre-existing dirty repository work.
69. Fresh git status must precede bridge source writes.
70. If any planned tracked target became dirty concurrently after inspection, treat it as protected and stop/replan.
71. The new action should be small enough to understand without reading the whole Drive backend.
72. Error responses should come from existing Drive services where possible rather than being rewritten into lossy generic errors.
73. Do not swallow partial-publication information if the existing bootstrap service returns it.
74. Do not claim atomic rollback if the service does not guarantee it.
75. Do not add a fake `sitePublishStatus` just because replay concerns exist; map a real status service first.
76. Do not expose `services` in normalized action input.
77. Do not expose a caller-controlled `sourceVessel` if that value affects authority; if retained, normalize it as descriptive testimony only.
78. Do not assume `requestId` is authorization; it is audit/idempotency testimony only.
79. Do not let `primary:true` silently override another existing primary site without relying on existing mapping policy behavior.
80. Do not special-case `asdf` or `awtsmoos-bounce` in production source.

## Revised design after critique

The bridge should be even thinner than the first two plans suggested.

### Action name

Use:

`sitePublishBootstrap`

### Trusted dispatcher contract

The outer function should look conceptually like:

`dispatchSitePublication($i, userId, payload, dependencies)`

where `dependencies.bootstrapSiteProject` defaults internally to the real service.

### Payload normalization

Use an explicit whitelist copy.

Do not reject malicious identity keys merely because they are present; simply do not forward them. Tests should prove they cannot override trusted context.

Allowed publication fields:

- aliasId;
- projectId;
- siteId;
- rootPath;
- name;
- title;
- runtimePreference;
- bindings;
- providerIntents;
- enabled;
- primary;
- subdomainRequested;
- files;
- requestId.

Bridge-supplied fields:

- `$i`;
- `actorUserId: userId`;
- `sourceVessel: "awtsmoos-virtual-os"` unless a safer descriptive constant already exists.

Explicitly omitted caller fields:

- userId;
- actorUserId;
- credentialId;
- services;
- `$i`.

### Dispatcher integration

`hostedVirtualOs/dispatcher.js` should remain a routing file only:

- recovery?
- publication?
- ordinary osFs fallback.

No Drive business logic in that file.

### Scope integration

`sitePublishBootstrap` belongs in `WRITE_ACTIONS`.

Do not create a new scope category unless evidence demands one. Existing `tunnel.write` is the bounded mutation authority already used for filesystem writes and snapshots.

## Testing hierarchy

After code:

1. pure input/action-name tests if needed;
2. publication dispatcher unit test with fake bootstrap;
3. hosted dispatcher routing test;
4. scope test;
5. existing recovery test;
6. existing fsVessel/Virtual-OS tests;
7. existing Drive bootstrap/service/route tests;
8. syntax checks;
9. line-count audit;
10. `git diff --check`;
11. focused status/diff proving protected work remains.

## Critique refrain

The Awtsmoos gives identity its hidden root,
So no payload mask may counterfeit the fruit.
Awtsmoos.com shall bridge only what the server truly knows,
And let existing Drive law decide where publication flows.
