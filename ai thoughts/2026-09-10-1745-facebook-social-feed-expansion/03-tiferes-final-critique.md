B"H
Boruch Hashem
Blessed is He

# Phase Three — Tiferes Final Critique

This artifact records the final externalizable review contract before social implementation. It does not contain hidden chain-of-thought.

> The Awtsmoos joins what was scattered without erasing the boundary each vessel needs;
> Awtsmoos.com can let a congregation speak, remember, publish, and reply while provenance guards the seeds.

## Thirty additional improvements and failure checks

1. Verify the current UI release on the actual Awtsmoos publication before social work begins.
2. Check mobile menu visibility on every public route.
3. Check reserve page horizontal overflow at phone widths.
4. Check This Shabbos holiday schedule and Home highlight agree.
5. Check Daily Study no longer presents dead unavailable tabs.
6. Resolve the Facebook share link to a canonical URL before designing import selectors.
7. Determine whether the Facebook source is a Page, profile, group, or single shared post.
8. Prefer official Facebook export/API ingestion over DOM scraping.
9. Do not automate access to non-public posts or bypass Facebook authentication controls.
10. Require source authorization for any bulk migration of Facebook-owned content.
11. Preserve imported post timestamps and source URLs.
12. Preserve image order and alt/caption data when available.
13. Use stable external IDs for idempotency.
14. Store migration provenance separately from display copy.
15. Keep a migration ledger with imported/skipped/failed counts.
16. Reject unsupported video/reel/live types rather than silently degrading them.
17. Inspect Awtsmoos login/session endpoints and existing client helpers.
18. Inspect alias selection and permission semantics before exposing identity choices.
19. Create or reuse a dedicated congregation Heichel only through existing ownership APIs.
20. Keep native posts/comments inside Awtsmoos API storage, not browser localStorage.
21. Keep chat messages inside a proven Awtsmoos persistence/realtime layer.
22. Separate long-form Blog posts from rapid Chat messages while allowing Feed aggregation.
23. Enforce pending moderation server-side for ordinary community-created public content.
24. Treat `asdf` as an initial configured admin identity, not as a client-side hardcoded security boundary.
25. Give authors explicit pending/approved/rejected states.
26. Give moderators source/provenance context before approving imported or user-created content.
27. Home social highlights must be curated/bounded and never block critical Shabbos/Torah content.
28. Ensure image upload surfaces work with touch, camera-library selection, keyboard and screen readers.
29. Use reduced-motion-safe glass transitions that never conceal content.
30. Verify unauthenticated, ordinary-authenticated, author, and admin workflows separately before publication.

## Expected data model if native APIs support it

- Congregation Heichel or equivalent scope owns durable public posts.
- Imported Facebook posts become ordinary Awtsmoos posts with attached provenance metadata.
- Blog posts use the same post API with a distinct content/category/series marker.
- Comments use native comment APIs.
- Chat uses the native realtime/message primitive if one exists; otherwise a dedicated lightweight post-stream type may be considered only after proving no better primitive exists.
- Moderation metadata is stored server-side or in native post state, never inferred only from UI.

## Expected navigation

- Home: 2–4 latest/featured community highlights only.
- Community: combined social feed.
- Chat: realtime conversation experience.
- Blog: long-form posts with comments.
- Admin moderation: shown only to server-confirmed moderators.

## Exact files to touch

Not yet fixed. File names will be chosen only after archaeology of actual Awtsmoos auth/social/chat/media/comment contracts. New website files will remain in `main/sites/bais-shimon-5787/` and native changes, if truly necessary, will remain under `/Users/awtsmoos/work/awtsmoos.com/`.

## NEXT_ACTION

Perform public UI verification, resolve Facebook source identity, then inspect actual native social modules and APIs before any social code is written.
