B"H

Boruch Hashem

Blessed is He

# Phase Three — Forty Final Refinements Before Source Writes

The Awtsmoos renews the world without confusion, and Awtsmoos.com must renew its social world the same way: one truth, many vessels, each boundary bright enough to test and small enough to trust.

1. Keep the physical realtime transport completely untouched; all new social intelligence must consume existing application clients.
2. Split the dedicated shell catalog from its markup so adding sections never turns `MessagingAppShell.js` into a navigation registry plus DOM factory.
3. Make Activity, Discover, Online, and Settings explicit sections rather than overloading Mail/Public Torah panels.
4. Require a verified private alias for Activity and Settings because both expose owner state.
5. Allow Discover and Online to render useful public/session-safe states while signed out; private personalization appears only after verified alias session.
6. Add an identity card that states Alias, Ploni, or Hidden without showing account ids, socket ids, or ownership internals.
7. Build Online from the universal chat server-trusted presence projection only; never infer identity from connected sockets.
8. Move anonymous hide preference from `localStorage` to `sessionStorage`; authenticated server preference remains authoritative.
9. Keep `MessagingSpecialView.js` untouched because it is already near the 120-line ceiling and correctly owns sign-in, Mail, and friend policy panels.
10. Delegate new special sections to `MessagingWorkspaceSections.js` instead of extending `MessagingSectionController.js` into a giant switch.
11. Split app store-change refresh logic into `MessagingStoreRefresh.js` so the top-level controller gets smaller while gaining new sections.
12. Keep search local to already-authorized loaded summaries and rendered metadata; do not label it global private-message search.
13. Give the search field an explicit scope label such as “Search this workspace” and a clear button.
14. Preserve conversation-body privacy by never indexing loaded message text into a public or sitewide search structure.
15. Implement private older-history pagination through a new store prepend/dedupe primitive rather than replacing the current bucket.
16. Sort merged private history by numeric sequence and dedupe by message id, falling back to sequence when ids are absent.
17. Preserve viewport anchor after older messages are prepended; only initial/open/live-new-message renders scroll to the bottom.
18. Put “Load older” in the thread header and hide it when no accepted conversation is open.
19. Keep private history page size at the existing 50-message boundary unless the server contract proves a different safe limit.
20. Treat an empty older page as the end of the currently retrievable private history and disable the button calmly.
21. Build Activity from `/api/social/unified-social/activity/:alias`, relying on the existing owner-verification server gate.
22. Never render a private activity query/body field unless its capture preference permits it and the returned event explicitly contains it.
23. Give Activity clear export/preferences/clear affordance only after the exact owner APIs are verified; first render can remain read-only if mutation semantics are not needed for this slice.
24. Build Discover from public recommendation candidates plus owner-authorized meaningful activity, but rank the combination locally so private interests do not get sent to a public endpoint.
25. Treat the existing recommendation reason strings as candidate evidence, not authoritative personalization explanations.
26. Add diversity caps so one Heichel/type cannot occupy the entire first page of Discover.
27. Prefer recent meaningful activity topic/title metadata only when already returned under owner authorization; never fetch private message bodies to improve ranking.
28. Provide a session-only personalization reset that clears local interest/ranker state without deleting the server activity ledger.
29. Clearly distinguish “reset suggestions for this session” from “clear my activity history.”
30. Do not invent a universal Saved section until a canonical storage owner exists; omit it from the first implementation rather than creating misleading persistence.
31. Related Torah must call only universal-chat `SEARCH`; the new reader intelligence code must contain no `PUBLISH` request path.
32. Bound post/comment semantic context to a compact title plus excerpt, with a hard client maximum before it reaches the source-search protocol.
33. Require substantial Latin/English comment text before comment intelligence activates; short emoji/reaction comments should never trigger RAG.
34. Require sustained visibility before search: approximately 3 seconds for a substantial comment and 5 seconds for the post-level reading module.
35. Use IntersectionObserver at a meaningful visibility threshold and cancel dwell timers when focus leaves the reading region.
36. Deduplicate related-Torah work by stable bounded-context fingerprint and keep only a small session cache.
37. Render returned Torah sources only with DOM text APIs and explicit safe links; never inject returned title/excerpt as HTML.
38. Record only a meaningful related-source open event, never the generated private query text or full comment/post body.
39. Split Heichel comment rendering so reaction transport, safe card rendering, and reading intelligence do not share one monolithic file.
40. Replace the current comment-author `innerHTML` interpolation with safe text nodes when that file is rewritten, reducing a real XSS surface while preserving behavior.

## Final quality adjustments
- Add true mobile list → thread state with an explicit back control instead of merely stacking both panes.
- Put high-level section navigation at the bottom on narrow screens where safe-area padding is available.
- Keep desktop information density in the rail/list/main/details hierarchy, with presence and identity visible but calm.
- Add focused CSS modules rather than changing `layout.css`, which is already at 119 lines.
- Make every new control keyboard-operable and expose status changes through existing or new live regions.
- Use existing tests as regression anchors, then add direct unit contracts for ranking, history merge, section policy, related context, and search-only RAG use.
- Run browser geometry measurements at every requested width after the first code pass and repair any document overflow or trapped mobile state.

## NEXT_ACTION
Freeze the exact first-pass source/test file contract, then begin whole-file source writes with new leaf modules before rewriting their coordinators.
