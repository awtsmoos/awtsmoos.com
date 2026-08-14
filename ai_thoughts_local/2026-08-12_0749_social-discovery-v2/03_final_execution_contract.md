B"H

# Social Discovery II — Final Execution Contract

Boruch Hashem — Blessed is He.

## Concrete safeguards and improvements

1. Omitted `aliases` means bounded public discovery; explicit `aliases` remains scoped.
2. Public alias enumeration reads child IDs only, never recursive raw alias records.
3. Raw `info.user` must never enter a public response.
4. Public alias records are normalized to explicit safe fields.
5. Alias-universe page defaults are modest and capped.
6. Feed/trending aggregate at most 50 aliases per request.
7. Search must not aggregate every public profile.
8. Global search first ranks cheap alias metadata.
9. Full profile expansion is limited to top matching aliases.
10. Empty global search returns lightweight alias results only.
11. Exact alias ID matches rank first.
12. Exact display-name matches rank next.
13. Prefix matches outrank substring matches.
14. Profile/content matches remain bounded.
15. Search result types are explicit: alias/post/comment/heichel.
16. Results without a real destination never get a fake link.
17. Logged-out `/feed` becomes useful automatically from the public universe.
18. Logged-out `/trending` becomes useful from the same bounded universe.
19. Logged-in personalized feed from the prior batch remains intact.
20. Add first-class `people` route/chamber.
21. People chamber mounts before navigation restores direct routes.
22. People search uses stale-request sequencing.
23. Empty People query shows public aliases rather than expensive full content.
24. People alias results open Profile through the existing deep-link system.
25. Typed content results use safe destinations only.
26. People search supports Enter submit.
27. People search supports clear/reset.
28. Search input has a real accessible label.
29. Search status uses polite live announcements only for state changes.
30. Every new action has a 44px minimum target.
31. People cards collapse to one column on mobile.
32. No horizontal overflow at mobile widths.
33. No blur/backdrop-filter in new styles.
34. No `innerHTML` or `insertAdjacentHTML` in new UI.
35. Transport/state/view/render/ranking responsibilities stay separate.
36. Backend privacy/universe logic gets its own focused module.
37. Search ranking/normalization gets its own focused module if needed.
38. Compressed `discovery.js` must be fully rewritten/split if touched.
39. No partial patches; whole-file rewrites only.
40. Tabs for indentation in every touched source file.
41. Every touched/new source file carries B"H/Boruch Hashem/Blessed is He/Awtsmoos commentary.
42. Every authored production/style/test file stays <=120 lines.
43. Explicit-scope preservation gets a backend test.
44. Global fallback gets a backend test.
45. Owner-metadata non-leakage gets a backend test.
46. Alias pagination/max caps get tests.
47. Cheap-ranking-before-profile-expansion gets tests.
48. People safe-DOM and route tests are required.
49. Logged-out global feed behavior gets a contract test.
50. Existing Network/Profile/Follow/history regressions remain green.
51. CSS quality must remain green.
52. Every final touched file is reread in full after green tests.
53. Planned-vs-actual differences are recorded physically.
54. No Git commit/push.
55. No direct canonical server Git mutation.
56. No systemd/release-authority change.
57. Final `npm run bh` is only a refusal proof under canonical Git.
58. No local feature is called live without independent production proof.

## Provisional source families

Backend: new public-alias-universe helper; new ranking/normalization helper if needed; whole-file rewrite/split of `helper/profile/discovery.js`; focused backend tests. Avoid `_awtsmoos.profile.js` unless route changes prove unavoidable.

Client: RouteModel/SocialHubState for `people`; new `js/people/PeoplePanel.js`, `PeopleView.js`, `PeopleResultRenderer.js`; AppAssembly/HubApp; PublicDiscovery messaging/scope only if current behavior needs adjustment; SocialHubApi only if new query helpers are required; focused People CSS/tests.

## Pre-mutation evidence gate

Freshly reread current candidate files; record exact line counts and Git status; verify alias root constant/path; verify current search/feed client shapes; verify no concurrent local edits would be overwritten. Then write a confirmed exact-file execution note before product mutation.

## Completion gate

Syntax green; new privacy/global-discovery/People tests green; all existing Social Hub regressions green; CSS quality green; all authored files <=120; exhaustive final readback; audit recorded; one final `npm run bh` refuses at `canonical_git_authority` before snapshot build/upload with unchanged HEAD and no new snapshot artifacts.
