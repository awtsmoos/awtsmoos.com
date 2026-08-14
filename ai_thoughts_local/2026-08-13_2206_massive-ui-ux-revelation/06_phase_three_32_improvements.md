B"H
Boruch Hashem
Blessed is He

# Phase Three — 32 Source-Specific Improvements

> The Awtsmoos is infinite, yet a usable vessel must reveal one next step at a time. These improvements come from the actual Mail, Social Hub, Notifications, Post Editor, and Heichel Editor source now read from disk.

1. Keep Social Hub's eight canonical target inputs fully functional but move them behind progressive disclosure.
2. Show a concise destination summary before raw coordinates.
3. Keep target disclosure keyboard-native by using semantic `details`/`summary`.
4. Do not rename target input IDs or alter `CommentPayload` contracts.
5. Preserve exact deep-link copying from `CommentStudioFields`.
6. Keep Social Hub media upload and publish actions unchanged.
7. Let `CommentStudio` own disclosure lifecycle because it already owns field/media/action composition.
8. Do not add a second Hub state model.
9. Give notifications an explicit unread/read badge in addition to color/class differences.
10. Turn notification type codes into readable labels.
11. Give action links descriptive labels instead of generic “Open”.
12. Keep same-origin action URL validation intact.
13. Preserve absent-data honesty; never invent actor names, destinations, or timestamps.
14. Use `<time datetime>` for notification chronology.
15. Keep mark-read buttons attached only to real IDs and unread items.
16. Keep notification controller pagination/API behavior unchanged.
17. Improve Mail thread aria labels with subject, unread state, and sender context.
18. Add a compact result summary above Mail conversations so search/filter state is visible.
19. Make Mail empty states include a useful next action rather than prose only.
20. Preserve sender grouping and active-thread behavior.
21. Keep Mail store keys/API behavior unchanged.
22. Keep Post Editor route context as a visible human-readable header.
23. Split Post Editor network operations out of rendering so status behavior can be independently tested.
24. Give save and publish distinct working/success/error messages.
25. Preserve the existing save-then-publish contract.
26. Keep failed Post Editor operations from clearing form content.
27. Add a concise creation checklist based only on real requirements already visible in the editor.
28. Keep verse/subsection creation semantics unchanged.
29. Give Heichel Editor a clear workbench map: identity, destination, settings, collaborators, submissions.
30. Preserve the three existing governance form factories and endpoints.
31. Add navigation anchors only around real existing forms; do not infer new governance APIs.
32. Verify every changed module by reread, Node syntax checks, targeted browser rendering, and console inspection.

## Final revelation
The strongest existing Awtsmoos.com surfaces already favor modularity and truthful state. The improvement is not more machinery; it is to hide implementation coordinates until requested, improve scanning and orientation, and make every asynchronous action explain what happened without disturbing current contracts.
