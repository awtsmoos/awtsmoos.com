B"H

# Extreme Social — Final Execution Contract

Boruch Hashem — Blessed is He.

This third planning pass converts the unbounded social vision and provisional architecture map into an execution covenant. It is intentionally specific about behavior, safety, structure, and verification while remaining honest that the exact source mutation list must be finalized only after fresh step-C inspection of the current checkout.

## Thirty-plus concrete improvements and safeguards

1. Public discovery remains the first useful logged-out experience.
2. Feed failure must not disable profile lookup.
3. Identity-bootstrap failure must not disable public discovery.
4. Profile relationship enrichment failure must not erase a valid base profile.
5. Latest/Trending modes must have deterministic active state and truthful status text.
6. Exact alias lookup remains a reliable fallback even if richer search is limited.
7. Never claim `/api/social/search` is global unless current helper/source proves it.
8. Add one focused social-route state owner for chamber/profile/query synchronization.
9. Direct profile deep links must open the profile chamber without manual lookup.
10. Browser back/forward must restore chamber and selected profile when feasible within current navigation contracts.
11. Relationship alias navigation must reuse the existing Profile chamber rather than invent a second profile URL system.
12. Followers and alias-type following entries may become profile navigation targets.
13. Non-alias follow targets must remain typed context, not fake profiles.
14. Keep relationship previews/list calls bounded.
15. Do not expose Follow/Unfollow unless fresh backend inspection proves an ownership authorization guard exists.
16. Logged-out relationship intent becomes login guidance, never a failing mutation button.
17. Owner-only composer/comment/promote actions require a verified active alias.
18. Public profile identity should show display name, alias handle, description, visible-content stats, and relationship counts compactly.
19. Do not expose account IDs, email, storage paths, private alias metadata, or internal slash coordinates.
20. Feed cards should have one obvious primary destination and an optional profile doorway only when a real alias is present.
21. All dynamic social UI must use safe DOM APIs; no `innerHTML` or `insertAdjacentHTML`.
22. All actionable controls meet a 44px minimum reachability floor.
23. Mobile social surfaces must remain one-column where dense multi-column layouts would compress identity/action text.
24. No horizontal overflow at representative mobile widths.
25. No `backdrop-filter` or blur-heavy full-screen treatment in new social UI.
26. Keep surfaces centered/compact on desktop rather than expanding giant glass panels.
27. Add focus-visible states to new buttons/links/inputs.
28. Every input must have an accessible label or equivalent semantic naming.
29. Status announcements use `aria-live` sparingly and only for real state transitions.
30. Stale profile/search requests should not overwrite newer navigation state; introduce abort/request sequencing if current architecture needs it.
31. Avoid duplicate base-profile/living-card network calls for the same navigation event.
32. Normalize ambiguous API result shapes in focused pure helpers rather than inside DOM renderers.
33. Keep API route construction explicit and testable.
34. Keep transport/state/view/render responsibilities split into real modules.
35. Add new class owners only where they represent stateful/coordinating concepts; do not use decorative inheritance.
36. Every touched authored source/style/test file uses tabs for indentation.
37. No compressed one-line functions in touched files.
38. Every touched source file begins with B"H, Boruch Hashem, Blessed is He, and an Awtsmoos/Awtsmoos.com poetic architectural comment.
39. Every new/touched authored file stays at or below 120 lines; split responsibilities before testing rather than deleting documentation/newlines.
40. Whole-file rewrites only; no partial patch/replace/insert operations.
41. Existing public-discovery, relationship, identity, activity, comment, legal, state, and surface tests remain green unless a deliberate contract change is documented.
42. Add focused route-state/deep-link tests if route behavior changes.
43. Add focused public-search tests only for capabilities proven by current API source.
44. Add profile relationship navigation tests for alias and non-alias targets.
45. Add safe-DOM tests for every new renderer/view.
46. Add CSS tests for touch target floor/no-blur/mobile wrapping where styles change.
47. Run syntax checks on every touched JavaScript module.
48. Run CSS quality when any stylesheet changes.
49. Reread every touched file completely after the final green test pass.
50. Record planned-vs-actual differences in `ai_thoughts_local/2026-08-11_2255_extreme-social/` before considering the local batch complete.
51. Do not run a production publish while canonical Git remains the serving authority and this workspace cannot commit/push.
52. `npm run bh` must continue to refuse with `canonical_git_authority` rather than falsely claiming these local changes are live.
53. Never dirty the canonical server Git checkout or reinstall the obsolete immutable snapshot authority to force publication.
54. Never claim production contains a local feature unless production is independently verified to serve it.

## Provisional implementation families

The exact file list is **not frozen yet**. Step C must reread the current files first. Expected families:

- navigation/route state;
- public discovery/search;
- public feed-card identity navigation;
- profile panel/renderer/relationships;
- state/app wiring;
- focused styles;
- focused tests.

## Step-C evidence requirements before source mutation

- Full reads of NavigationController, SocialHubState, PublicDiscovery, PublicDiscoveryView, PublicFeedCard, SocialHubApi, ProfilePanel, ProfileRenderer, ProfileRelationships, AppAssembly, HubApp.
- Current line counts for those files.
- Current route/hash/query semantics from navigation/state source.
- Current search helper route/query/response shape from social API source.
- Current follow write helper ownership/auth behavior.
- Current public profile/living-card relationship shapes.
- Current tests/style owners that would be affected.
- Current local Git status for exact candidate files only, so concurrent work is not overwritten.

## Completion sequence

1. Step C: read-only source/API inspection.
2. Write an exact-file mutation note based only on actual findings.
3. Step D+: whole-file implementation, source first.
4. Syntax/focused tests, then broader regressions/CSS quality.
5. Full touched-file reread and planned-vs-actual audit.
6. Local release-authority safety proof only; no false production publication.

The Awtsmoos creates every instant anew; this contract therefore refuses stale memory as authority. Every mutation must be justified by the source as it exists at the instant we touch it.
