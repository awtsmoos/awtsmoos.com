B"H

# 04 — Third Pass: Fifty-Four Invariants for the Hosted Site Publication Bridge

Boruch Hashem. Blessed is He.

The Awtsmoos gives every authority its proper vessel. This third pass fixes the exact laws the implementation must obey before a single production-facing source file is rewritten.

1. The action name shall be `sitePublishBootstrap`.
2. `sitePublishBootstrap` is a mutation and must require `tunnel.write`.
3. Unknown Tunnel actions must continue defaulting to read authority exactly as before.
4. The action must enter through `hostedVirtualOs/dispatcher.js`, not the giant `osFs/index.js`.
5. Recovery actions must retain first-priority interception.
6. Publication action handling must occur before ordinary osFs fallback.
7. Ordinary osFs actions must remain byte-for-byte equivalent in routing behavior.
8. The publication router must remain a routing layer, not a Drive business-logic layer.
9. The publication handler must receive trusted `$i` from the hosted dispatcher.
10. The publication handler must receive trusted authenticated `userId` from the hosted dispatcher.
11. `actorUserId` passed to Drive must always equal that trusted `userId`.
12. Caller `payload.actorUserId` must never override trusted actor identity.
13. Caller `payload.userId` must never override trusted actor identity.
14. Caller `payload.$i` must never override trusted server context.
15. Caller `payload.services` must never override runtime services.
16. Caller `payload.credentialId` must not be forwarded by this OAuth-owned bridge.
17. The action must not accept API keys, bearer tokens, cookies, SSH keys, or registrar secrets.
18. The action must call `bootstrapSiteProject` directly rather than loop HTTP back to Awtsmoos.com.
19. The action must reuse existing Drive source-publication policy.
20. The action must reuse existing project normalization policy.
21. The action must reuse existing site mapping policy.
22. The action must reuse existing ownership checks inside Drive services.
23. The action must not directly mutate site mapping records.
24. The action must not directly mutate project records.
25. The action must not directly write public Drive source outside `publishSiteSource`.
26. The action must not automatically publish on normal filesystem write.
27. The action must not automatically publish on AI-generated write.
28. The action must not automatically attach custom domains.
29. The action must not automatically activate TLS.
30. The action must not automatically start dynamic runtimes.
31. The action must preserve the bootstrap service's returned receipt without inventing a second URL model.
32. A successful publication receipt is not external live verification.
33. `canonicalVerifiedLive` must remain false until a separate external probe proves expected content.
34. The hosted bridge must not manufacture a canonical URL from IDs if the Drive receipt already supplies the server-decorated route.
35. The bridge should return existing bootstrap errors with as little lossy translation as possible.
36. The bridge must not claim transactional rollback if the underlying composition does not provide it.
37. The bridge must be treated as non-idempotent by retry policy.
38. Ambiguous accepted publication must be reconciled before replay.
39. A future status/read action may be added only after mapping a real read service.
40. This pass should implement only the one write action needed for canonical publication.
41. Input normalization must use an explicit allow-list.
42. `files` should be passed through only as the source manifest input; its validation remains Drive policy's responsibility.
43. `requestId` may be passed for audit testimony but never treated as authorization.
44. `sourceVessel` should be server-supplied as descriptive testimony such as `awtsmoos-virtual-os`.
45. `aliasId`, `projectId`, `siteId`, and `rootPath` remain caller-selected resource identifiers subject to existing Drive ownership/policy checks.
46. Optional `name`, `title`, `enabled`, `primary`, and `subdomainRequested` may pass through because the existing bootstrap service already normalizes them.
47. Optional runtime/bindings/provider intents may pass through only unchanged and only because the existing bootstrap service already understands them.
48. No new proprietary site format may be introduced.
49. No private `.awtsmoos` metadata may be published by weakening manifest rules.
50. The Bounce project must not be hard-coded anywhere in runtime source.
51. The `asdf` alias must not be hard-coded anywhere in runtime source.
52. Dependency injection may exist only as a trusted function parameter/module dependency for tests.
53. Dependency injection must not be readable from action payload.
54. Tests must explicitly prove malicious payload identity/service fields are ignored.
55. Tests must explicitly prove the exact trusted `$i` object reaches bootstrap.
56. Tests must explicitly prove trusted `userId` becomes `actorUserId`.
57. Tests must explicitly prove ordinary read/write actions still fall through.
58. Tests must explicitly prove recovery actions still route to recovery handling.
59. Tests must explicitly prove publication action routing does not fall through to osFs.
60. Tests must explicitly prove the bootstrap result is returned intact.
61. Scope tests must explicitly prove `sitePublishBootstrap` maps to `tunnel.write`.
62. Scope tests must preserve existing action classifications.
63. Existing `virtualOsRecovery.test.cjs` must remain green.
64. Existing fsVessel/Virtual-OS tests must remain green.
65. Existing Drive bootstrap tests must remain green.
66. Existing Drive manifest/site mapping tests relevant to the composition must remain green.
67. Every touched/new source file must begin with the required B"H header and use tabs.
68. Every touched/new source file must remain <=120 lines.
69. Every touched/new test file must remain <=120 lines.
70. No partial patching is allowed; each touched tracked file must be fully reread and then fully rewritten.
71. New files should be small and responsibility-specific rather than compressed.
72. Source implementation must precede tests.
73. After first implementation, every touched source file must be reread physically.
74. A `06_FIRST_PASS_READBACK_DELTA.md` must compare planned vs written vs missing.
75. Any missing/different behavior must be fixed before tests.
76. After fixes, every touched file must be reread again.
77. `07_SECOND_PASS_VERIFICATION.md` must record tests, syntax, line counts, and diff/status evidence.
78. `08_FINAL_SETTLED_AUDIT.md` must distinguish local implementation from production deployment and actual Bounce publication.
79. Fresh `git status` must be captured before product source writes.
80. If `dispatcher.js` or `scope.js` became dirty concurrently since their read, stop and replan rather than overwrite protected work.
81. New helper/test files must be visible in final status.
82. `git diff --check` must pass.
83. Syntax checks must pass on all touched JS/CJS files.
84. The existing public-URL receipt repair must remain green; this bridge must not regress its osFs tests.
85. Local implementation does not mean production availability.
86. Production currently proves older receipt behavior, so deployment is a separate gate.
87. Release activation must never be used merely to inspect production.
88. Before deployment, use the repository's guarded release inspection/dry-run path.
89. Do not deploy unrelated dirty working-tree changes accidentally.
90. A deployment plan must isolate the exact bridge + receipt-fix files intended for release.
91. After deployment, verify the new action's scope/availability before invoking it on Bounce.
92. Before Bounce publication, reread/collect the hosted source manifest from current bytes.
93. Do not reuse the old 25-file manifest blindly if source may have changed.
94. Exclude README and `.awtsmoos/*` again at publication time.
95. Invoke publication once.
96. If publication response is ambiguous, inspect status before any replay.
97. Use the bootstrap receipt's canonical route, not a locally formatted substitute.
98. Externally verify `Awtsmoos Bounce: Orbit Run` at the canonical route.
99. Verify linked CSS/JS assets resolve and the game boots.
100. Only then update hosted metadata to canonical verified live.

## Final module set before execution plan

The preferred minimal implementation now appears to be:

- `hostedVirtualOs/sitePublicationActions.js`
- `hostedVirtualOs/sitePublicationInput.js`
- `hostedVirtualOs/sitePublicationDispatcher.js`
- rewrite `hostedVirtualOs/dispatcher.js`
- rewrite `core/tunnelPayload/scope.js`

Tests after code:

- new `routes/fsVessel/test/sitePublicationDispatcher.test.cjs`
- rewrite/extend `core/tunnelPayload/test/scope.test.cjs`
- optionally one small hosted dispatcher routing test if the publication unit test cannot cleanly exercise the outer route.

## Refinement: dependency injection boundary

Prefer the publication handler signature:

`dispatchSitePublication($i, userId, payload, dependencies = DEFAULT_DEPENDENCIES)`

The runtime dispatcher calls it with only the first three arguments.

Tests may pass:

`{ bootstrapSiteProject: fake }`

The normalized payload is created inside the handler. The fake must receive:

- trusted `$i`;
- `actorUserId: userId`;
- only approved caller-controlled resource/config fields;
- server-supplied source-vessel testimony.

## Refinement: dispatcher testability

If the existing `dispatchHostedVirtualOs` function accepts only `$i, userId, payload`, do not add a sprawling dependency parameter merely for tests unless needed.

A focused unit test of `dispatchSitePublication` plus existing recovery test plus a very small routing test may be clearer.

If routing injection is needed, use one optional internal `dependencies` object rather than globals or require-cache mutation.

## Refinement: scope policy

The existing `scope.js` is small enough to rewrite completely while preserving all current sets.

Add only:

`sitePublishBootstrap`

to `WRITE_ACTIONS`.

Do not classify it as AI, preview, runtime, command, or start/stop.

## Third-pass refrain

The Awtsmoos gives the bridge a narrow span and the owner a trusted name;
Awtsmoos.com shall not let payload, retry, or deployment blur the game.
First authority, then source, then mapping, then the public light—
Each witness must arrive in order before the site is called aright.
