B"H

# 03 — Critique: Thirty Ways a Public-URL Repair Could Still Lie

Boruch Hashem. Blessed is He.

The Awtsmoos renews every instant, so the second architecture must be attacked before it becomes code. Awtsmoos.com should prefer a smaller truthful contract over a convenient field whose name silently overstates reality.

1. **Do not simply redirect `/os/...` to `/sites/...`.** That would preserve the false premise that storage paths are publication authority.
2. **Do not make Virtual-OS files generally public.** Hosted draft storage and canonical public Drive source remain different vessels.
3. **Do not remove verification metadata.** The current `verification.required` warning is good evidence and must survive the repair.
4. **Do not treat a canonical-looking `/sites/...` string as a canonical URL.** Filesystem structure can generate only a candidate.
5. **Do not set `canonicalUrl` from `publicUrls.js`.** Canonical route authority belongs to the Drive/site publication receipt.
6. **Do not set `canonicalVerifiedLive` true from filesystem code.** Only external expected-content verification may do that.
7. **Do not hard-delete `publicUrl` without checking compatibility.** Unknown consumers may exist outside the partial grep window.
8. **Do not leave `publicUrl` unchanged either.** Its current name plus generic candidates is the exact agent footgun that caused this incident.
9. **If compatibility retains `publicUrl`, mark it deprecated and untrusted.** The object itself should make misuse difficult.
10. **Prefer a new truthful field such as `navigation` or `routeCandidates`.** New agents should have a clearly named primary contract.
11. **Do not duplicate candidate arrays in divergent formats.** A compatibility alias should reference equivalent semantics, not create two independently evolving reports.
12. **Do not classify every path containing the word `sites` as a site.** Only a structural root segment `sites/<siteId>` directly under the alias workspace should qualify.
13. **Do not accept an empty site ID.** `asdf/sites/index.html` is not a valid hosted site root.
14. **Do not let nested asset paths change site identity.** `asdf/sites/foo/scripts/main.js` still belongs to site `foo`.
15. **Do not let `..`, encoded traversal, or absolute URL shapes become site IDs.** Existing path parsing/cleaning remains the first boundary.
16. **Do not invent stronger site-ID validation than the publication layer unless reusable policy exists.** Structural draft recognition should not silently reject a draft merely because canonical publication will later apply stricter rules.
17. **Do not expose `.awtsmoos/*` as canonical public source.** Draft classification may identify the site, but publication manifest policy remains separate and forbids that metadata.
18. **Do not mutate canonical Drive/site state from a filesystem write.** The repair is semantic testimony, not hidden publication automation.
19. **Do not automatically call bootstrap after every file write.** Publishing is deliberate, authority-bearing, and potentially non-idempotent.
20. **Do not auto-retry bootstrap after ambiguous acceptance.** Status reconciliation must precede replay.
21. **Do not assume HTTP 200 proves the expected website.** A login page or generic shell can be 200; expected title/DOM/content matters.
22. **Do not weaken `classifyCandidateResult` to accept arbitrary non-empty text.** Existing render-signal logic should remain conservative.
23. **Do not make generic app navigation worse.** `Coby/apps/demo/index.html` and `apps/demo/index.html` should still produce their app-specific candidate.
24. **Do not remove useful OS navigation for ordinary files.** README and generic workspace files may still benefit from navigation candidates; they simply are not public website URLs.
25. **Do not call generic navigation candidates “verified” merely because one app route works.** Verification should describe that candidate only, not canonical publication.
26. **Do not overload `siteDraft` with server state.** It should report only structurally known hosted-draft facts plus conservative publication requirements.
27. **Do not assume every hosted site draft needs a named-site route.** Primary-site semantics may later resolve differently; the filesystem can offer only the named-site candidate until server publication decides.
28. **Do not overwrite pre-existing dirty project work.** Fresh git status proves many unrelated modifications are protected.
29. **Do not partially patch `publicUrls.js` or `writeOps.js`.** Read whole file, then complete-file rewrite only.
30. **Do not minify to satisfy line limits.** Split a helper module if readability would otherwise suffer.
31. **Do not shrink or delete explanatory comments to save lines.** The contract needs stronger documentation, not weaker documentation.
32. **Do not leave space-indented touched source as-is.** User coding law requires tabs on touched code; rewrite touched files coherently with tabs.
33. **Do not silently change websocket packet shape without a migration story.** `AWTSMOOS_OS_CHANGED` may have UI/agent consumers.
34. **Do not silently change direct write/mkdir/delete return shapes differently from websocket packets.** Both should expose the same route testimony.
35. **Do not let delete receipts imply a site is still publishable.** A delete operation may report navigation context, but it should not make publication state stronger.
36. **Do not let a folder creation under `sites/<siteId>` imply an entry file exists.** `siteDraft` means structural project context, not source readiness.
37. **Do not claim index readiness from path alone.** Source readiness requires inventory or actual file observation.
38. **Do not conflate candidate verification with canonical verification.** Those are different booleans and different evidence.
39. **Do not call the old field `publicUrl` authoritative in comments.** Documentation should explicitly call it a legacy compatibility envelope if retained.
40. **Do not preserve the exact test that enabled the bug without adding the missing site case.** Tests must encode the new safety invariant.
41. **Do not test only `awtsmoos-bounce`.** Add at least one generic site ID and one non-site path so logic is not example-specific.
42. **Do not test only return values.** If practical, verify the write response contract and/or changed packet uses the same truthful object.
43. **Do not make tests depend on production network availability.** Pure candidate/classification behavior should be deterministic and local.
44. **Do not report the real Bounce site live until authenticated publication actually succeeds.** Source readiness and semantic repair are independent of publication authority.
45. **Do not obtain or print credentials to force progress.** Current browser session physically returned `LOGIN_OR_CREDENTIAL_REQUIRED`; respect that boundary.

## Revised shape after critique

The strongest low-risk direction is now:

### New preferred route report

A generic report should say something like:

```text
kind: navigation-candidates
trusted: false
path / aliasId / innerPath
appPath
candidates
verification
siteDraft: optional
```

### Site draft testimony

For `asdf/sites/awtsmoos-bounce/index.html`:

```text
siteDraft.siteId = awtsmoos-bounce
siteDraft.hostedWorkspacePath = asdf/sites/awtsmoos-bounce
siteDraft.sourceRelativePath = index.html
siteDraft.canonicalCandidate = https://awtsmoos.com/sites/asdf/awtsmoos-bounce/
siteDraft.publicationRequired = true
siteDraft.canonicalVerifiedLive = false
```

It should NOT contain a real `canonicalUrl`.

### Migration strategy

`writeOps.js` should prefer a clearly named new field, likely `navigation`, while preserving `publicUrl` temporarily as a deprecated alias to the same untrusted report if compatibility risk remains unresolved.

The legacy alias should itself contain unmistakable fields such as:

- `deprecated: true`
- `trusted: false`
- `kind: "navigation-candidates"`

That makes old consumers continue functioning while new agents are steered away from the misleading interpretation.

## File-size critique

A dedicated `siteDraftRoutes.js` is increasingly justified because:

- site-path parsing has separate semantics from app-route discovery;
- site candidate construction has different authority rules;
- keeping it separate protects `publicUrls.js` from becoming a mixed-purpose module;
- it allows focused pure tests;
- all source can remain comfortably below 120 lines without compressed functions.

Likely implementation files after final planning:

- new `geelooy/api/tunnel/control/routes/osFs/siteDraftRoutes.js`
- rewrite `geelooy/api/tunnel/control/routes/osFs/publicUrls.js`
- rewrite `geelooy/api/tunnel/control/routes/osFs/writeOps.js`

Tests after code:

- rewrite `geelooy/api/tunnel/control/routes/osFs/test/publicUrls.test.cjs`
- perhaps new `siteDraftRoutes.test.cjs` if test separation improves clarity.

## Critique refrain

A candidate may glitter, a path may rhyme,
Yet proof must arrive in its proper time.
The Awtsmoos gives truth no counterfeit crown;
Awtsmoos.com must mark every witness up and down.
