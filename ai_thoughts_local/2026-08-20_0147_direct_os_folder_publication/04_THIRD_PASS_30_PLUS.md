B"H

# 04 — Native Third Pass: One Hundred Twenty Invariants for Direct OS Folder Publication

Boruch Hashem. Blessed is He.

The Awtsmoos creates public identity and private source without confusion. These invariants sharpen the previous architecture and critique before any runtime source is rewritten.

## Canonical identity and source modes

1. Canonical identity remains aliasId + siteId.
2. Canonical route belongs to the site, never the storage backend.
3. Raw `/geelooy/os` remains editor/source navigation only.
4. `navigation` testimony remains untrusted.
5. `publication` testimony owns authoritative canonicalUrl.
6. `canonicalVerifiedLive` remains a separate external-observation state.
7. Add direct and snapshot source modes.
8. Direct means no publication copy.
9. Snapshot means bounded server-side copy through existing bootstrap.
10. Existing manifest `sitePublishBootstrap` remains supported.
11. Old mappings without source metadata remain Drive-backed.
12. New direct mappings opt into hosted VFS explicitly.
13. Source mode changes never change siteId/canonical URL.
14. Domain bindings remain site-identity based across mode changes.
15. Initial direct source must belong to the same alias as the site.
16. Cross-alias mounts are deferred.
17. Source path and siteId remain independent concepts.
18. Any allowed owned hosted folder may be published; `sites/` is not special.
19. Source deletion makes readiness false, not mapping deletion.
20. Source move/rename requires explicit remap.

## Direct gateway safety

21. Public request never chooses source root.
22. Mapping fixes alias and root before request-relative path handling.
23. Reuse existing VFS path jail rather than duplicate decoding rules.
24. Reject traversal after decoding/canonicalization.
25. Never call private authenticated osFs action routes from public HTTP.
26. Build a dedicated public VFS source adapter.
27. GET and HEAD only initially.
28. No directory listing.
29. `/` resolves mapped entry/index according to current site behavior.
30. Nested directory index remains inside fixed root if supported.
31. Exact asset reads remain inside fixed root.
32. File extension never triggers server execution.
33. MIME is server-derived.
34. Source metadata cannot inject arbitrary headers.
35. `.awtsmoos` remains private.
36. Git metadata remains private.
37. Recovery/trash/snapshot internals remain private.
38. `.env` family remains private.
39. Private-key and obvious credential artifacts remain private.
40. Existing secret/private-path policy should be reused where possible.
41. Safe `.well-known` handling must be deliberate rather than accidental.
42. Direct mode must preserve public quota/egress accounting.
43. Direct mode must preserve range behavior promised by current public response.
44. Direct cache semantics must reflect mutable live bytes.
45. Long immutable cache headers are forbidden unless content versioning justifies them.
46. Direct response must never leak DB metadata.
47. Unknown/missing direct source returns bounded unavailable/not-found semantics.
48. Missing index prevents ready state even when mapping exists.
49. Mapping may remain authoritative while source is unavailable.
50. Status must communicate that distinction clearly.

## Snapshot collector

51. Snapshot collection occurs server-side.
52. Agent should not upload every source body again.
53. Collector starts from one normalized owned folder root.
54. Collector never escapes that root.
55. Collector preserves binary bytes.
56. Collector enforces current max file count.
57. Collector enforces current max total bytes.
58. Collector rejects/skips reserved private metadata according to publication law.
59. Collector produces current bootstrap manifest contract.
60. Existing Drive manifest validation remains final policy.
61. Existing bootstrap remains canonical snapshot composition.
62. Snapshot provenance is descriptive, not public authority.
63. Snapshot edits do not become live until republish.
64. Snapshot mode remains available even if direct is default.
65. Direct mode should be default for the new folder action unless native product tests reveal a stronger constraint.

## Publication services and status

66. Add `sitePublishFolder` as write action.
67. Add `sitePublicationStatus` as read action.
68. Add `siteUnpublish` only if existing mapping delete/disable composes cleanly.
69. Unpublish never deletes source.
70. Keep `sitePublishBootstrap` write action.
71. Trusted hosted dispatcher supplies `$i` and authenticated userId.
72. Payload identity never overrides trusted actor.
73. Payload services/credentials never override trusted dependencies.
74. Folder publication service owns direct vs snapshot branching.
75. Direct branch authorizes source ownership before mapping mutation.
76. Snapshot branch authorizes source ownership before collection/bootstrap.
77. Mapping mutation reuses existing site registry service.
78. Do not create a second site store.
79. Publication result reports created versus updated when possible.
80. Publication result reports mode and source root.
81. Publication result reports canonicalPath/canonicalUrl.
82. Publication result reports sourceAvailable and entryReady.
83. Publication result does not claim externally verified live by default.
84. Status reuses the same `publication` vocabulary.
85. Status may include bounded safe domain summary if current service already supports it.
86. Status must not leak verification tokens or secrets.
87. Do not add expensive per-write mapping scans in first version.
88. Explicit status is the authoritative reconciliation action.

## Readiness and response architecture

89. Preserve existing Drive readiness helper for legacy/snapshot sites.
90. Add source-aware readiness rather than fake Drive entries.
91. Do not make synchronous `decorateSite` async casually.
92. Prefer an async publication/status composition if VFS DB inspection requires I/O.
93. Inspect current state/config repository before final schema fields are chosen.
94. Inspect current `publicResponse.js` before transport changes.
95. Reuse or extract common MIME/range/cache/metering law rather than duplicate it.
96. Keep site gateway focused on site identity, redirects, branding, and source dispatch.
97. Keep custom-domain ingress above source adapters.
98. Never modify Host-routing law merely to support direct source.
99. Unknown-host fail-closed behavior remains.
100. Public quota tests must remain green.

## Tunnel instructions and docs

101. OAuth GPTs call owned-device discovery after sign-in.
102. Exactly one live owned native route is auto-used by immutable routeReference.
103. Multiple live routes require user choice.
104. Friendly tunnelName is display/manual compatibility only.
105. Do not ask OAuth users to paste tunnelName when discovery already resolved one route.
106. No native route means offer agent refresh/install OR Virtual OS according to task.
107. Virtual OS must be documented as requiring no native installation.
108. Direct hosted publication must work through Virtual OS with Mac offline.
109. Rerunning the same installer is the supported native refresh flow.
110. Docs distinguish dispatched-pending-acceptance, accepted/running, and terminal.
111. Non-idempotent publish pending requests are resumed, not duplicated.
112. Accepted ambiguity requires status reconciliation before replay.
113. Public docs must stop teaching raw `/geelooy/os` as a site-like destination.
114. Use returned `publication.canonicalUrl` instead.
115. Fix repeated `no params` action cards at schema/generator source.
116. Action docs show name, scope, read/write, vessel support, payload, result, replay law, and example.
117. Direct and snapshot examples must both render.
118. Builder and docs use the same Direct/Live Folder versus Snapshot Copy language.
119. Manual/API-key flow remains documented separately.
120. Bootstrap/control guidance and Human API docs should share one canonical setup model where practical.

## Code, test, and release law

121. Refresh all remaining native source before product edits.
122. Fresh git status must precede every tracked rewrite batch.
123. Protected dirty targets stop/replan rather than overwrite.
124. Whole-file rewrites only.
125. Tabs and readable JSDoc in source.
126. Every authored source/test file <=120 lines.
127. Split responsibilities instead of compressing.
128. Source implementation precedes test authorship.
129. Full source readback precedes tests.
130. First-pass delta ledger records planned vs actual.
131. Fix deltas by whole-file rewrites only.
132. Reread all touched files after fixes.
133. Run complete current osFs tests.
134. Run complete current fsVessel tests.
135. Run Tunnel scope/action-schema/docs tests.
136. Run site mapping/gateway/status/project/bootstrap/source/quota/credential tests.
137. Run custom-domain ingress/gateway tests.
138. Add direct path privacy/traversal/cache/source-edit/source-delete tests.
139. Add snapshot collector binary/limit/private-metadata tests.
140. Add mode-switch canonical identity tests.
141. Syntax-check all touched JS/CJS/MJS.
142. Final line-count audit.
143. `git diff --check`.
144. Focused diff and final status proving protected work remains.
145. Local success is not production deployment.
146. Release from clean isolated reconstruction only.
147. Verify production action catalog/scopes after deployment.
148. Recollect Bounce source immediately before publication.
149. Publish Bounce direct exactly once.
150. Verify canonical title, assets, and game boot before live claim.

## Final third-pass revelation

The direct-mode improvement is not a new public filesystem. It is a new **site source adapter** behind the existing site identity boundary.

That distinction preserves the strongest parts of the existing system: mapping ownership, custom-domain confinement, canonical routing, quota law, and public-site identity. Only source transport changes.

## Third-pass refrain

The Awtsmoos gives one site identity while its bytes may breathe live or rest as a snapshot.
Awtsmoos.com shall not expose the filesystem; it shall expose the site whose mapping binds one lawful source.
Thus every owned folder can become public without needless copying, while privacy, quota, domains, and canonical truth remain one.
