# B"H — Phase Two: Diagnosis and Improved Design Plan

## Verified diagnosis
The foundation is functional and modular, but the visual hierarchy still spends too much space on equal-weight containers. Home desktop renders a 1,014px hero; mobile renders a 1,408px hero before the feed. Quantum Mail has zero viewport overflow and a correct mobile sender/thread transition, yet the sender deck presents identity, compose, search, six sender categories, nine folders, and empty state with nearly equal emphasis.

The December Mail snapshots confirm the original DNA: a black void, modular extreme styles, physics filters, and a dedicated communications instrument. The current shared Geelooy header and modern modules should remain; obsolete standalone navigation should not return.

## Improvement ledger
1. Compress Home desktop above-fold depth without removing real destinations.
2. Reduce Home mobile hero depth by keeping action portals in two columns down to very narrow phones.
3. Give the hero a deliberate two-column spatial score instead of one vertical stack.
4. Keep the Aleph orbit as a coordinate beacon, not a giant empty-space consumer.
5. Make search the main horizontal lens and Torah the secondary source gate.
6. Turn four creation routes into an asymmetric command cluster rather than equal dashboard cards.
7. Make Write visibly primary without making the other routes unclear.
8. Introduce cut corners, coordinate marks, and edge rails to replace generic rounded rectangles.
9. Turn the feed list into a visible transmission river with a vertical energy spine.
10. Alternate post alignment on wide screens while preserving natural DOM order.
11. Keep feed cards full-width on mobile for readability.
12. Reduce decorative blur volume and use sharper luminous edges for performance and clarity.
13. Make the Home side chambers feel like one stacked signal tower.
14. Keep the side tower sticky only where viewport height allows it safely.
15. Preserve all existing native links, forms, and feed buttons.
16. Preserve reduced-motion behavior and visible focus.
17. Refine Mail’s outer frame into an asymmetric instrument with clearer sidebar/chat separation.
18. Make the Mail status rail read as a live coordinate strip, not a generic header.
19. Compress the Mail identity crown so useful thread space appears earlier.
20. Give Compose a decisive gold transmitter shape and preserve its real modal event.
21. Make sender categories compact frequency chips on mobile rather than a tall grid.
22. Keep folders horizontally scannable and visually distinguish the active folder.
23. Strengthen thread row sender/subject/snippet/time hierarchy.
24. Add a visible active-thread edge and unread/priority affordance without inventing counts.
25. Make the empty Mail stream a charged navigation state with legible instructions.
26. Separate incoming cyan and outgoing gold through edge geometry as well as color.
27. Keep composer controls readable and reduce decorative animation around text entry.
28. Preserve the mobile slide transition and back control.
29. Keep Mail inside the shared unusual header rather than restoring a duplicate shell.
30. Retain current alias/profile dropdown mounting and safe GET-backed store behavior.
31. Avoid changing route, API, thread, compose, delete, or authentication logic in this visual pass.
32. Use full-file rewrites only, each focused module remaining under roughly 120 lines.
33. Re-run all contract tests after the style rewrite.
34. Re-capture desktop and mobile screenshots from fresh authenticated Chrome targets.
35. Verify dead links, horizontal overflow, forms, dialogs, and visible controls after the rewrite.

## Dependency graph
- Home geometry depends on existing `index.html` child order.
- Home feed geometry depends on current `liveFeed.js` classes and real article rendering.
- Shared responsive rules affect all main Geelooy routes, so selectors must remain Home-specific.
- Mail geometry depends on `ui/layout.js`, `ui/sidebar.js`, and `ui/chat/layout-parts/*` class contracts.
- Mail mobile behavior depends on `.app-container.view-chat`, `.sidebar`, `.chat-area`, and `.back-button`.
- Profile identity depends on `.mail-sidebar-profile-mount` and the shared profile dropdown.
- Contract tests depend on exact route, class, label, and button strings; this pass avoids changing them.

## Risk controls
- No JavaScript rewrite unless a verified visual requirement cannot be achieved in CSS.
- No API request changes.
- No fake unread counts, thread contents, aliases, or statistics.
- No global selectors that alter unrelated routes.
- No `!important` expansion beyond existing integration boundaries.
- No removal of semantic labels or native anchors.
- No modification of unrelated dirty files.