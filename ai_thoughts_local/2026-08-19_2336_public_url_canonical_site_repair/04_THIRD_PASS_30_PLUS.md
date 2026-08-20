B"H

# 04 — Third Pass: Forty-Two Final Invariants Before Code

Boruch Hashem. Blessed is He.

The Awtsmoos creates every witness according to its vessel. This third pass therefore refuses to let compatibility, convenience, or a familiar field name blur the boundary between storage navigation and canonical publication.

1. A filesystem write receipt proves bytes changed, not that a website is public.
2. A navigation candidate must carry `trusted: false` by default.
3. A navigation candidate must never populate `canonicalUrl`.
4. A site-draft classifier may produce `canonicalCandidate`, never canonical authority.
5. `canonicalVerifiedLive` must be false in all filesystem-only testimony.
6. Website-draft recognition should trigger only for `<alias>/sites/<siteId>` rooted directly beneath the alias workspace.
7. A nested file beneath that root must retain the same `siteId`.
8. The site-draft workspace root should stop at `<alias>/sites/<siteId>` rather than include the current file path.
9. The remaining path should be exposed separately as a source-relative path.
10. Empty `siteId` means no site draft.
11. A bare `sites` folder means no site draft.
12. `.awtsmoos` metadata may belong to the hosted site project structurally but remains excluded from canonical public source by manifest policy.
13. Site-draft classification must not perform any network request.
14. Site-draft classification must not mutate Drive state.
15. Site-draft classification must not inspect authentication.
16. Site-draft classification should be a pure helper suitable for deterministic tests.
17. Generic app-route extraction must remain unchanged for `apps/...` and `Coby/apps/...` paths.
18. Generic OS/user navigation candidates remain useful for non-site workspace files.
19. The preferred new report name should emphasize navigation rather than publication.
20. `writeOps.js` should emit the preferred new report consistently in websocket packets and direct responses.
21. If `publicUrl` remains temporarily, it should be a compatibility alias to the same report object semantics rather than a second interpretation.
22. The compatibility object must explicitly contain `deprecated: true` if surfaced under `publicUrl`.
23. The compatibility object must explicitly contain `trusted: false`.
24. The compatibility object must explicitly contain `kind: "navigation-candidates"`.
25. The preferred report may also use `kind: "navigation-candidates"` so old and new shapes agree.
26. `verification.required` remains true for route candidates.
27. Candidate verification should preserve `DYN_ROUTE_NOT_FOUND`, 404, `Cannot GET`, and not-found text as rejection signals.
28. A candidate reaching HTTP 200 proves only that candidate, not canonical site publication.
29. Expected DOM/title verification remains required before a candidate is treated as a useful final navigation link.
30. A verified app-navigation candidate still must not become a canonical website URL.
31. A filesystem delete should preserve only route context; it must not imply the deleted draft is publishable.
32. A mkdir under `sites/<siteId>` should report structural site context but not source readiness.
33. A write to `index.html` should not automatically set source readiness because linked assets may still be absent.
34. No filesystem operation should automatically invoke `bootstrap-site-project`.
35. Canonical publication remains an explicit `drive.write + drive.public` operation.
36. The existing `bootstrap-site-project` server receipt remains the only source for canonical path authority in this flow.
37. External expected-content verification remains the only source for `canonicalVerifiedLive:true`.
38. The current Bounce site remains publication-pending until an authenticated Drive carrier exists.
39. The repair must never scrape or reveal API keys, bearer tokens, cookies, or private browser state.
40. Current `LOGIN_OR_CREDENTIAL_REQUIRED` evidence must remain an explicit blocker, not something bypassed.
41. The current protected dirty working tree must remain untouched outside the isolated URL-report files and new ledger/helper/test files.
42. Every source write must be a complete-file rewrite with tabs, readable functions, B"H header, and Awtsmoos JSDoc/poetic commentary.
43. `publicUrls.js`, `writeOps.js`, and any new helper must each remain <=120 lines.
44. Tests come after implementation, in accordance with the user coding constitution.
45. The first post-write act is full readback of every touched source file.
46. Any mismatch between planned and actual files becomes a delta item before testing.
47. Syntax checking must run on every touched CommonJS source.
48. Focused public URL tests must pass before broader Tunnel/OS regressions.
49. `git diff --check` must pass for this repair.
50. Final git status must prove unrelated dirty work was not erased.
51. A regression assertion must include the exact incident class: `asdf/sites/awtsmoos-bounce/index.html`.
52. That assertion must prove no `/os/...` candidate is represented as canonical site authority.
53. The site-draft report should contain the named-site candidate `https://awtsmoos.com/sites/asdf/awtsmoos-bounce/` only as `canonicalCandidate`.
54. The test should assert `publicationRequired === true`.
55. The test should assert `canonicalVerifiedLive === false`.
56. The test should assert a true `canonicalUrl` is absent or null.
57. A generic README test should prove it has no `siteDraft` at all.
58. An app-route test should prove app navigation still functions.
59. A non-HTTP candidate result should remain inconclusive rather than falsely accepted.
60. The final documentation/ledger must distinguish systemic source repair from the still-pending authenticated site publication.

## Final module decision

Create a dedicated helper:

`geelooy/api/tunnel/control/routes/osFs/siteDraftRoutes.js`

Why:

- site-draft semantics are independent of generic app navigation;
- canonical-candidate construction needs a stronger authority disclaimer;
- pure classification deserves focused tests;
- splitting prevents `publicUrls.js` from becoming a mixed-purpose module;
- line limits remain comfortable without compression.

### Proposed helper contract

`siteDraftReport(aliasId, innerPath, origin)` returns null for non-site paths.

For a site path it returns approximately:

```text
kind: hosted-site-draft
siteId
hostedWorkspacePath
sourceRelativePath
canonicalCandidate
publicationRequired: true
canonicalVerifiedLive: false
canonicalUrl: null
```

The actual exact field set will be kept small and serializable.

## `publicUrls.js` final direction

Rewrite completely to:

- use tabs;
- retain public origin/app-route/candidate-result helpers;
- import `siteDraftReport`;
- rename internal semantics toward navigation;
- return an explicit untrusted report;
- preserve `publicUrlReport` export as a compatibility entry point if needed, but have it return the safer report shape;
- keep candidate verification grammar intact.

Potential report:

```text
{
  kind: "navigation-candidates",
  trusted: false,
  path,
  aliasId,
  innerPath,
  appPath,
  candidates,
  verification,
  siteDraft
}
```

No canonical URL field at the top level.

## `writeOps.js` final direction

Rewrite completely to:

- import the safer report builder;
- attach preferred `navigation` field;
- preserve `publicUrl` as a deprecated compatibility alias only if necessary;
- ensure change packets and direct write/mkdir/delete responses share the exact same semantics;
- keep hash/syntax behavior unchanged.

One compatibility possibility:

```text
navigation: report
publicUrl: { ...report, deprecated: true }
```

This duplicates serialization but not interpretation. If broader consumer evidence shows a cleaner compatible option, refine before writing.

## Test strategy after code

Rewrite the existing focused test after code is complete. Add a separate site-draft helper test only if it improves separation.

Minimum cases:

- public origin normalization;
- app route discovery;
- generic route candidates are untrusted;
- candidate verification rejection/acceptance;
- plain README has no site draft;
- `asdf/sites/awtsmoos-bounce/index.html` has site-draft testimony;
- canonical candidate is correct;
- canonical URL is not asserted;
- publication required remains true;
- live verification remains false.

## Final third-pass refrain

The Awtsmoos gives each witness its measured voice,
And Awtsmoos.com must preserve that choice.
A storage path may whisper where one might go,
But only publication and proof may say what is so.
