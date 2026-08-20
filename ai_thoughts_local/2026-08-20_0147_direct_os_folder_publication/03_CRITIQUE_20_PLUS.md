B"H

# 03 — Native Critique: Direct Publication Must Be Simpler for Users and Stricter for Servers

Boruch Hashem. Blessed is He.

The Awtsmoos creates concealment and revelation together. Removing the copy step is only an improvement if authority, path safety, private-source policy, cache behavior, quota, status truth, and Tunnel replay law become clearer rather than weaker.

## One hundred failure modes and refinements

1. Never make `/geelooy/os/<alias>/<path>` the canonical site URL.
2. Never let a public request choose an arbitrary hosted source root.
3. Never infer canonicalUrl from a write receipt.
4. Never return authoritative canonicalUrl from navigation testimony.
5. Direct publication must be explicit and authenticated.
6. Ordinary writes must never create mappings implicitly.
7. Generated `index.html` must not auto-publish.
8. `sitePublishFolder` must require `tunnel.write`.
9. Payload userId must not override trusted identity.
10. Payload actorUserId must not override trusted identity.
11. Payload `$i`, services, or credentialId must not override trusted context.
12. Public gateway must not impersonate the owner to call private osFs actions.
13. The stored mapping fixes alias and source root before public relative-path resolution.
14. Traversal must be rejected after decoding/canonicalization.
15. Encoded separators, schemes, controls, drive forms, and `..` remain rejected.
16. `.awtsmoos` remains private in direct mode.
17. Git, trash, recovery, and snapshot internals remain private.
18. `.env`, credential, and private-key material remain private.
19. Reuse native private-path law before inventing a competing deny list.
20. Safe web-standard hidden paths need deliberate policy, not blanket exposure.
21. Direct publication must never execute source by extension.
22. GET/HEAD remain initial methods.
23. Never expose directory listings.
24. Index fallback must stay inside mapped source root.
25. MIME must be server-derived.
26. Source bytes must not control arbitrary public response headers.
27. Existing egress/quota law must apply to direct mode.
28. Direct mode must not bypass quota because Drive visibility metadata is absent.
29. Existing range semantics must remain compatible.
30. Cache law must not hide live edits behind immutable TTLs.
31. Deleting direct source makes readiness false; it does not silently delete mapping.
32. Moving direct source does not retarget mapping automatically.
33. Direct edits must be documented as immediately live.
34. Snapshot edits must be documented as requiring republish.
35. Mode switches preserve siteId and canonical URL.
36. Mode switches preserve domain bindings because domains bind site identity.
37. Old mappings without source metadata remain Drive-backed.
38. Never reinterpret legacy rootPath as VFS source automatically.
39. Initial direct mode stays same-alias; cross-alias mounts are deferred.
40. Unpublish never deletes source bytes implicitly.
41. Snapshot collector stays below one owned source root.
42. Snapshot collector preserves binary bytes.
43. Snapshot collector enforces current file-count ceiling.
44. Snapshot collector enforces current total-byte ceiling.
45. Snapshot collector must not send giant file bodies through Tunnel.
46. Tunnel must not duplicate final Drive manifest policy.
47. Publication receipts remain bounded.
48. `sitePublishFolder` is non-idempotent for transport replay guidance.
49. Durable pending publish is resumed, never duplicated.
50. Accepted ambiguity must reconcile status before replay.
51. RequestId is continuity/audit testimony, never authorization.
52. `sitePublicationStatus` is read-only and authoritative.
53. Status distinguishes mapped, enabled, sourceAvailable, entryReady, verifiedLive.
54. Mapping success is not expected-content verification.
55. HTTP 200 alone never proves the site.
56. Login/app/error shells never count as verified site content.
57. Custom-domain Host resolution remains site-identity based.
58. Never allow Host to map directly to raw filesystem source.
59. Unknown-host fail-closed behavior must remain unchanged.
60. Direct mode must not auto-activate DNS, TLS, or domains.
61. Awtsmoos authoritative nameservers remain separate until infrastructure exists.
62. Existing `sitePublishBootstrap` remains supported.
63. Direct source schema is explicit opt-in and backward compatible.
64. Avoid mapping scans on every write until indexing cost is measured.
65. Prefer explicit status before `publicationsAffected` write testimony.
66. Do not auto-derive siteId until native collision policy is fully traced.
67. Updates should report created/updated and source-mode changes clearly.
68. Never overwrite another alias's mapping.
69. Current synchronous `decorateSite` should not be made async casually.
70. Direct readiness may belong in a separate async status composition.
71. Do not duplicate range/MIME/cache/metering before `publicResponse.js` is read.
72. Do not code direct reader before quota/cache/content dependencies are traced.
73. Do not code docs fix before docs generator/source is traced.
74. OAuth docs must stop demanding pasted tunnelName when immutable discovery resolves one route.
75. Manual/API-key flow remains distinct for non-OAuth clients.
76. Friendly tunnelName is display compatibility, not durable authority.
77. One live owned route should auto-use routeReference.
78. Multiple live routes require user choice.
79. No live native route should offer restart/install OR Virtual OS according to task.
80. Virtual OS must be documented as requiring no native agent.
81. Hosted direct publication must work with Mac offline.
82. Docs must distinguish pending acceptance, accepted/running, and terminal.
83. Acceptance timeout means mutation did not begin.
84. Accepted ambiguity is different and requires reconciliation.
85. Docs must never recommend duplicate non-idempotent mutations while pending.
86. Repeated `no params` docs rendering must be fixed at generator/schema source.
87. Action docs need name, scope, read/write, vessel support, payload, result, replay law, example.
88. Docs need both direct and snapshot examples.
89. Docs must say raw `/geelooy/os` is editor/source navigation, not the site URL.
90. Builder and Tunnel docs should share Direct/Live Folder versus Snapshot Copy language.
91. All touched code files stay <=120 lines.
92. Every tracked modification is a whole-file rewrite after complete read.
93. New modules stay responsibility-specific, not compressed.
94. Tests are authored after source implementation settles.
95. Full source readback precedes tests.
96. Relevant osFs/fsVessel/Drive/site/domain/docs regressions remain green.
97. Protected dirty primary worktree remains untouched outside intended files.
98. Local implementation is not production deployment.
99. Release uses clean isolated reconstruction, not dirty-tree subtraction.
100. Final Bounce live claim requires deployment, one direct publish, and expected title/assets/game boot.

## Revised minimal implementation

Implement first:

- backward-compatible source descriptor in site mapping;
- direct VFS static source adapter;
- source-aware publication status/readiness;
- server-side snapshot folder collector;
- `sitePublishFolder` direct/snapshot;
- `sitePublicationStatus`;
- `siteUnpublish` only if existing delete path composes cleanly;
- Tunnel scopes, routing, and bounded input normalization;
- authoritative publication vocabulary;
- OAuth/Virtual-OS/publishing docs and action-schema rendering.

Defer until measured or proven:

- cross-alias mounts;
- direct-pinned revisions;
- per-write publication scans;
- dynamic runtime changes;
- custom-domain source-mode changes;
- nameserver changes.

## Critique refrain

The Awtsmoos removes the needless copy, not the boundary.
Awtsmoos.com must make live-folder publication easier to ask for and harder to misuse.
The public site receives one canonical name; the private source receives exact Gevurah.
Then direct mode is not a shortcut around law, but a cleaner revelation of the law itself.
