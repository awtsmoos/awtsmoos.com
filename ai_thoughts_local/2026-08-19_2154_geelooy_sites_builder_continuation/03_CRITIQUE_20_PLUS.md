B"H

# 03 — Critique: Twenty-Plus Corrections Before Product Writes

Boruch Hashem. Blessed is He.

The Awtsmoos creates beyond the first form, so the plan is challenged before it is trusted. These are concrete improvements to the first composition, not hidden assumptions.

1. **Do not make builder state a second source of truth.** Keep only UI selection/draft state there; Drive bytes remain authoritative after Save.
2. **Preserve public metadata on overwrite.** Read entry metadata before writing content and resend mime/visibility/cache policy.
3. **Do not use `updateEntry` blindly for source writes.** Its backend path is correct, but the caller must supply preserved metadata to avoid accidental privatization.
4. **Do not widen project config just to store a brief.** A private real Drive metadata file is safer for this composition and leaves the existing backend contract stable.
5. **Do not put the brief in localStorage.** It should persist through Drive authority and never create a browser-only project identity.
6. **Do not expose the Drive credential through the agent object.** The agent surface can call services that close over normal transport state without returning auth material.
7. **Do not re-render Code on every app refresh.** Update labels/inventory while preserving the textarea object.
8. **Do not re-render Preview on every app refresh.** Keep one iframe instance and refresh only on explicit preview actions or source load.
9. **Do not duplicate the protected domain controller.** Remove Domain rendering from the legacy publication workspace and give one dedicated builder Domain root ownership.
10. **Do not modify the protected domain modules.** Adapt around their current exports and verify them with their existing tests.
11. **Do not touch `siteControls.js`.** It is already exactly 120 lines; preserve its root IDs by nesting `#project-workspace` under Publish.
12. **Do not call Tunnel from embedded Drive.** Source preview is local; full-folder Tunnel preview remains an advanced separate stage.
13. **Do not represent source preview as live publication.** The UI must label draft vs saved/canonical status.
14. **Do not imply canonical publication creates a domain.** Publish and Domain remain distinct panes and action namespaces.
15. **Do not imply TXT ownership means HTTPS.** Existing domain UI already separates DNS, routing, and TLS; reuse it unchanged.
16. **Do not add an Awtsmoos nameserver mutation.** The authoritative adapter is not deployed; surface unavailable metadata truthfully.
17. **Do not make source inventory unbounded.** Limit recursive collection to 64 entries and filter HTML/CSS/JS/MD source types.
18. **Do not hide truncation.** Project collection should report bounded/truncated semantics when the server indicates more entries.
19. **Do not call the bootstrap action with unproven complex URL-encoded payloads.** Starter creation can compose proven file writes plus site mapping until JSON body transport is intentionally added.
20. **Do not create opaque starter state.** Each starter is just generated real files plus a canonical site mapping.
21. **Do not regenerate starter source after creation.** Once written, the files belong to the user; future edits operate on those bytes.
22. **Do not create a separate desktop app tree.** CSS alone expands the same semantic details/nav structure.
23. **Do not use desktop minimum widths.** All grid children need `min-width: 0`, code/URLs must wrap, and preview containers must clamp.
24. **Do not let the fixed mobile dock cover content.** Reserve bottom padding plus `env(safe-area-inset-bottom)`.
25. **Do not make summary touch targets too small.** Builder summaries/buttons must meet 44px minimum primary target height.
26. **Do not rely only on CSS to make one pane open.** Dock/controller logic should close sibling `<details>` when one opens.
27. **Do not make native summaries unreachable.** Dock buttons are shortcuts; each `<summary>` remains semantic/keyboard accessible.
28. **Do not make Files disappear.** Build needs a direct “Files” action that opens the advanced Files details and scrolls to it.
29. **Do not auto-save Code while typing.** Explicit Save prevents surprising mutations and keeps authority prompts/errors understandable.
30. **Do not silently discard unsaved Code when opening another file.** Track a dirty flag and require an explicit user action before replacing the editor; machine `code.open` should return a structured conflict unless `force` is requested.
31. **Do not preview arbitrary non-HTML as an HTML page.** Preview defaults to root `index.html`; other code types remain inspectable in Code.
32. **Do not inject scripts into the builder document.** Preview runs in a sandboxed iframe; the builder itself never evals website source.
33. **Do not grant the preview iframe same-origin powers casually.** Use the smallest sandbox set needed; avoid `allow-same-origin` for raw draft `srcdoc` unless a concrete requirement proves it necessary.
34. **Do not lose relative linked assets.** Insert a controlled `<base>` pointing at the canonical site root for saved assets when a canonical URL exists, and explain this behavior.
35. **Do not report an agent action “available” merely because a UI button exists.** Availability metadata comes from actual connected state/server capability assumptions and should be conservative.
36. **Do not make agent results inconsistent.** Every invoke path catches errors and returns the common envelope rather than throwing transport-specific shapes outward.
37. **Do not let machine domain methods bypass existing domain APIs.** Agent methods import the same `domainApi.js` functions used by the human Domain panel.
38. **Do not create a shell API in the machine surface.** Runtime/Git remain outside this builder slice unless bounded server actions are explicitly mapped later.
39. **Do not test only happy DOM text.** Add identity, overflow, disabled-state, secret-leak, and embedded-mode request tests in browser evidence.
40. **Do not claim a fresh green baseline until the suite actually runs after writes.** Preserve the historical 93/93 figure only as historical context.
41. **Do not modify unrelated dirty files when fixing tests.** If a failure is rooted in protected work, document it instead of overwriting user changes.
42. **Do not trust write receipts.** Read every touched file from the device after implementation before test claims.

## Revised implementation character

The builder becomes a thin revelation layer over mature Drive/site/domain contracts. New code is mostly browser orchestration and pure helpers. Backend mutation is unnecessary for the first strong slice because the required real source read/write, canonical site mapping, and domain ownership systems already exist.

## Awtsmoos refrain

A shortcut may sparkle and still be a lie;
The Awtsmoos gives truth that no shortcut can buy.
Awtsmoos.com shall compose what the backend already knows,
And each guarded route is the vessel through which creation flows.
