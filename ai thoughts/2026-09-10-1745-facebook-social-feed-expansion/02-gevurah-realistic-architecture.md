B"H
Boruch Hashem
Blessed is He

# Phase Two — Gevurah Realistic Architecture

This artifact records externally useful architectural decisions and review gates. It does not contain hidden chain-of-thought.

> The Awtsmoos gives boundless possibility, yet useful light enters measured vessels in time;
> Awtsmoos.com can join imported memory and native community without letting permissions blur the line.

## Architecture candidates

### A. Pure site-local social backend
Rejected unless native archaeology proves Awtsmoos social lacks required primitives. It would duplicate identity, comments, moderation and feed storage.

### B. Native Heichel as congregation social domain
Preferred candidate. Create or reuse a dedicated Heichel owned/administered through Awtsmoos, store imported Facebook posts and native blog posts there, and render a site-specific client over existing post/comment APIs.

### C. Existing global Awtsmoos feed only
Potentially useful for discovery, but insufficient alone if congregation-specific moderation, chat and featured-home curation require a bounded community context.

### D. Chat as posts/comments only
Could provide MVP semantics, but should be rejected if a proven native realtime/chat primitive already exists. Chat needs room chronology, unread state and composer behavior distinct from long-form blog posts.

### E. Hybrid native model
Likely winner if supported: Heichel/posts/comments/media for durable feed/blog; existing realtime message room for chat; Awtsmoos aliases/session for identity; one site client coordinating both.

## Facebook migration design

Preferred ingestion hierarchy:

1. Facebook Graph API with a page access token belonging to an authorized page manager.
2. User-provided Facebook Page export/archive processed server-side.
3. Admin-only browser-assisted manual capture for a bounded subset when neither API nor export exists.

The production server should never depend on brittle Facebook DOM scraping. A migration worker may parse authorized export/API responses into a normalized import record:

- `externalProvider`: `facebook`
- `externalPostId`
- `sourceUrl`
- `publishedAt`
- `text`
- `media[]`
- `mediaType`
- `originalAuthorLabel`
- `importedBy`
- `importedAt`
- `provenanceStatus`

Idempotency uses provider + external post ID. Importer defaults to text-only, image-only, and text+image posts; video/reels/live streams remain out of scope until separately verified.

## Moderation contract

- Public source/imported official posts may enter the congregation feed as approved only through an authenticated admin import operation.
- Ordinary community-authored feed/blog/chat submissions are persisted as `pending` unless a proven native role/policy says otherwise.
- `asdf` is the requested current administrator, but authorization must be checked by the server/native Awtsmoos permission system.
- The client may show admin controls only after server-confirmed capability, but client visibility is never authorization.
- Pending authors see their own submission state; ordinary visitors do not see pending content.
- Approve/reject actions must be auditable and idempotent.

## Mobile-first experience

- One community landing page with top identity, compact segmented navigation, and bottom-safe composer where applicable.
- Feed cards prioritize text and images with low layout shift.
- Chat bubbles use max readable widths and stable chronological flow.
- Blog cards expose comments inline without forcing nested page mazes.
- Image viewer supports pinch/zoom-friendly full-screen presentation through native browser behavior and a close control.
- Motion uses opacity/transform only, respects reduced motion, and never gates visibility.
- Touch targets target at least 44 CSS px.
- No horizontal overflow at 320 CSS px.

## Twenty implementation gates

1. Inspect native session endpoint and login redirect contract.
2. Inspect alias selection/identity APIs.
3. Inspect Heichel create/read/ownership APIs.
4. Inspect post create/list/update APIs.
5. Inspect comment create/list/reply APIs.
6. Inspect media upload APIs and constraints.
7. Inspect realtime/chat primitives and persistence.
8. Inspect notification/unread primitives.
9. Inspect moderation/permission primitives.
10. Inspect existing social UI for reusable patterns, not copy-paste assumptions.
11. Resolve Facebook share URL canonically.
12. Determine whether source is a Page, profile, group or single post.
13. Use Graph API only with verified required permissions/token ownership.
14. Never persist Facebook browser cookies or passwords server-side.
15. Preserve original source URL on imported content.
16. Prevent duplicate imported posts.
17. Sanitize untrusted text while preserving readable formatting.
18. Constrain image type/size and use native media storage.
19. Keep Home highlights curated and bounded.
20. Verify all public social APIs through authenticated and unauthenticated test cases.

## NEXT_ACTION

Finish UI public verification, resolve Facebook share target through the user-controlled browser, and inspect native social/auth/media/chat contracts before choosing implementation files.
