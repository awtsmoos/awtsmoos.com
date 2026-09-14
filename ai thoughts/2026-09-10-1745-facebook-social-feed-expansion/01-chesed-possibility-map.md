B"H
Boruch Hashem
Blessed is He

# Phase One — Chesed Possibility Map

This artifact records project-facing options and verification targets rather than hidden chain-of-thought.

> The Awtsmoos makes one living community from many voices in time,
> Awtsmoos.com can carry source, conversation, image, and comment in one truthful rhyme.
> Facebook may become an imported memory, not the permanent throne,
> while the native social graph becomes the vessel the community can truly own.

## Mission order

1. Close the current UI release through rendered publication verification.
2. Resolve the Facebook share URL to its canonical public source when access permits.
3. Archaeologize existing Awtsmoos auth, aliases, heichelos, posts, comments, media, chat, moderation and feed APIs.
4. Choose the smallest native social architecture rather than creating a parallel backend.
5. Build mobile-first Community Feed, Chat, Blog/Post, Comments and Moderation surfaces.
6. Add curated social highlights to Home without turning the home page into a feed wall.
7. Build a repeatable Facebook import pipeline for public source-owned posts that can be legally/technically retrieved.
8. Publish, test, compare planned-versus-actual, and close discovered work.

## Facebook import possibilities

- Preferred: Meta/Facebook Graph API when the source resolves to a Page and usable permissions/tokens exist.
- Acceptable bounded fallback: import a user-provided Facebook data export or source-owned archive.
- Possible discovery helper: browser-assisted enumeration of publicly visible posts, but not a durable scraping backend.
- Avoid: depending on undocumented Facebook DOM selectors, bypassing login/access controls, or storing a Facebook session cookie as a server credential.
- Import only public/source-owned content whose transfer is authorized.
- Prefer text-only and image-only/mixed-image posts first; preserve original timestamp and source URL.
- Keep Facebook import provenance in metadata so migrated posts remain distinguishable from native Awtsmoos posts.
- Use idempotency keys from Facebook post IDs when available so imports can be safely rerun.

## Awtsmoos-native social possibilities to inspect

- Alias/session authentication and selectable identity.
- Heichel ownership and membership.
- Posts/series and feed listing.
- Comments and nested replies.
- Media upload/storage.
- Realtime message/chat primitives.
- Moderation/approval state and admin checks.
- Existing social-network front-end components suitable for reuse.
- Existing feed/home aggregation endpoints.

## UX target

The social surface should feel like a calm futuristic WhatsApp/Facebook hybrid made specifically for Beis Shmuel:

- Bottom-safe mobile composer.
- Swipe/scroll-friendly message and post cards.
- Glass depth without reducing text contrast.
- Immediate visible content; animations enhance rather than gate rendering.
- Distinct tabs or segmented navigation for Feed, Chat and Blog.
- Image attachments with responsive preview and accessible alt text.
- Comments/replies visible without leaving the post context.
- Login state clear and recoverable.
- Moderation pending state explicit to authors.
- Admin queue available to authorized `asdf`, enforced by server capability rather than CSS/JS hiding.

## REMAINING_WORK

- [ ] Public UI release verification.
- [ ] Facebook source resolution.
- [ ] Native social/auth API map.
- [ ] Native chat/realtime map.
- [ ] Native media map.
- [ ] Native moderation map.
- [ ] Native blog/post/comment map.
- [ ] Exact write set.
- [ ] Whole-file implementation.
- [ ] Facebook import tool/pipeline.
- [ ] Mobile/desktop visual verification.
- [ ] Security/authorization verification.
- [ ] Publication verification.

## NEXT_ACTION

Verify the existing UI release publicly, while resolving the Facebook share URL through the interactive browser and beginning read-only social archaeology.
