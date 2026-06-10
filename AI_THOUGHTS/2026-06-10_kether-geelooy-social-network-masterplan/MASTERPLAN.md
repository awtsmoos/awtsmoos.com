B"H

# Kether Masterplan — Geelooy Heichelos Into A Full Social Network

## Grounded inspection already completed

- Connected tunnel: awt-u0_a300-26940.
- Repository root: /storage/emulated/0/Documents/git/awtsmoos.com.
- Root law read from AGENTS.md: inspect before claiming, test before declaring, rewrite complete files only, prefer small modules and real verification.
- Root listing includes geelooy/, social/, tests/, users/, AI_THOUGHTS/, package.json, index.js.
- Full root tree attempt failed because `.awtsmoos/actions/results/act_mq88o11x_9b6ede1d.json` vanished during traversal. This is a tool/tree traversal race inside `.awtsmoos`, not a project claim. I narrowed the tree to `geelooy/heichelos` successfully.
- `geelooy/heichelos` already has many social-looking modules: heichel UI modules, context menus, navigator, platform panel, notifications panel, recursive social layer tests, post/comment systems, submit flow, post renderer, style systems.
- `geelooy/API/social` already has a large API surface: aliases, heichel, posts, comments, graph, platform, notifications, packed event storage, follow, feed routes, rate limits, search, live routes, route coverage tests, real server write tests, concurrency stress tests.
- `package.json` already exposes useful scripts: `test:profile-menu`, `test:heichel-governance`, `test:platform-ui`, `test:real-server-writes`, `test:concurrency-failure`, `test:routes`, comments/posts/graph/notifications/platform tests.

## First visible problem from the screenshot and code

The three-dot card menu is visually present but likely not robust. `heichel/modules/contextmenu.js` still uses direct DOM construction, a module-level `navigatorInstance` cache, and hard-coded edit behavior. In the current code, editing a post passes `mode: 'create'` for non-series items. That is suspicious for a menu edit action and may explain broken edit flows. The menu also depends on CSS/global class behavior and creates absolute-positioned DOM directly, so mobile overflow and click-away behavior can fail.

## Big goal

Make Geelooy a real social network where every signed-in alias can:

1. Create and own one or more heichelos.
2. Customize profile at `geelooy/@alias` with profile identity, avatar/banner, bio, links, interests, pinned heichelos/posts, privacy settings, and follow graph.
3. Create posts, series, comments, replies, quotes, reposts, bookmarks, reactions, and nested discussion trees.
4. Discover content through feeds: following, interests, heichel, trending, recent, semantic search, notifications, and moderation queues.
5. Manage roles in heichelos: owner, admin, editor, contributor, moderator, member, blocked.
6. Stress-test all of it through isolated Node tests and localhost:8080 real server flows.

## Phase 0 — Stabilize the map before touching code

1. Read precise entry files in small batches only:
   - `geelooy/heichelos/heichel/app.js`
   - `geelooy/heichelos/heichel/modules/contextmenu.js`
   - `geelooy/heichelos/heichel/modules/ui/render/social-actions.js`
   - `geelooy/heichelos/heichel/modules/navigator.js`
   - `geelooy/heichelos/heichel/modules/api/*.js` selectively
   - profile route files under `geelooy/` and `geelooy/scripts/awtsmoos/social/test/profileMenuSimulation.test.mjs`.
2. Read relevant API route files:
   - `_awtsmoos.alias.js`, `_awtsmoos.heichel.js`, `_awtsmoos.posts.js`, `_awtsmoos.comments.js`, `_awtsmoos.graph.js`, `_awtsmoos.platform.js`, `_awtsmoos.notifications.js`.
3. Run static tests first:
   - `npm run test:profile-menu`
   - `npm run test:heichel-governance`
   - `npm run test:platform-ui`
   - `npm run test:routes`
4. Only after failures are real, rewrite complete files. No partial patches.

## Phase 1 — Fix the broken three-dot menu as the first thin slice

Target behavior:

- Every card menu opens reliably on mobile and desktop.
- Menu has data-driven actions depending on item type, user role, and state.
- Action list: open, edit, delete, clear series, share, copy API link, feature/pin, moderate, report.
- No stale module-level cached navigator instance.
- Menu position clamps inside viewport.
- Click-away, escape, scroll, resize close properly.
- Edit action must use the correct mode for posts and series.
- Tests simulate the screenshot state: cards under Series tab with visible three-dot buttons.

Implementation design:

- Split `contextmenu.js` into small modules if it needs meaningful change:
  - `contextmenu/actions.js`
  - `contextmenu/position.js`
  - `contextmenu/render.js`
  - `contextmenu/lifecycle.js`
  - `contextmenu/index.js`
- Keep each file complete and under 150 lines.
- Use JSON action manifests interpreted by a tiny renderer.
- Add intense but useful JSDoc to every public function.

Verification:

- Node simulation test for menu creation and action invocation.
- Existing `cardMenuContract.test.mjs`.
- Existing `profileMenuSimulation.test.mjs`.
- Browser/server smoke later.

## Phase 2 — Profile surprise upgrade at `geelooy/@alias`

Target UX:

- Profile header: avatar, banner, alias display, bio, stats, follow button, message button if enabled.
- Tabs: Posts, Replies, Heichelos, Series, Likes, About, Moderation.
- Owner edit mode: profile fields, interests, theme, pinned content, default heichel, privacy.
- Public heichel creation CTA: “Open a new Heichel.”
- Profile cards should not be dead panels; every stat links to real feeds.

API requirements:

- Alias profile read/write route.
- Profile permissions: owner-only writes, public-safe reads.
- Follow/unfollow graph route reuse.
- Interest tags stored as normalized social graph edges.
- Profile feed reads from posts/comments/packed feed materializer.

Tests:

- Create alias A and B.
- A edits profile.
- B follows A.
- A creates heichel and posts.
- B sees A in following feed.
- Public read hides private fields.

## Phase 3 — Every user can create their own heichel

Target UX:

- From profile and Heichelos home, create heichel wizard.
- Fields: name, description, visibility, interests, role policy, submission policy, moderation policy.
- Owner becomes root/admin automatically.
- Heichel page becomes a mini-community with series, posts, members, roles, about, rules, moderation.

API requirements:

- Ensure existing heichel creation route is usable from alias identity.
- Harden slug/title validation.
- Add governance tests for ownership and role inheritance.
- Add moderation queues for submissions/comments.

## Phase 4 — Real social primitives

Core entities:

- Alias profile.
- Heichel/community.
- Series/collection.
- Post.
- Comment.
- Reply DAG node.
- Reaction.
- Bookmark.
- Quote/repost.
- Follow edge.
- Interest edge.
- Notification event.

Principle:

- Use existing `geelooy/API/social/helper/platform`, `socialGraph`, `socialContent`, `comments`, and `packed` modules before inventing new storage.
- Add adapters rather than duplicating logic.
- Treat feeds as materialized projections from events.

## Phase 5 — Feed and discovery

Feeds:

- Home/following.
- For You/interest ranked.
- Heichel feed.
- Alias feed.
- Replies feed.
- Trending by reactions/comments velocity.
- Moderation feed for admins.

Ranking:

- Data-driven weights in small config modules.
- Combine recency, follow graph, interests, heichel membership, comment depth, quote velocity, moderation safety.

## Phase 6 — Full localhost:8080 real server tests

Plan:

1. Start or confirm server on localhost:8080.
2. Use isolated Node scripts, not browser first, to hit real endpoints.
3. Create multiple test aliases/accounts with unique timestamp IDs.
4. Login/session flow must be inspected; no guessing auth tokens.
5. Create heichel for each user.
6. Create series, posts, comments, nested replies.
7. Follow/unfollow graph.
8. React/bookmark/quote if routes exist; otherwise document missing routes.
9. Query feeds and notifications.
10. Stress test concurrency: many comments and follows at once.
11. Verify persistence by re-reading from API.
12. Clean up only if safe and explicit; otherwise use namespaced test data.

Commands likely useful after inspection:

- `npm run test:real-server-writes`
- `npm run test:concurrency-failure`
- `npm run test:live-smoke`
- `npm run test:platform-ui`
- `npm run test:profile-menu`

## Phase 7 — UI transformation

Heichel home:

- Turn Posts/Series into full content switcher: Posts, Series, People, About, Live, Moderation.
- Cards get stable menus, avatars, author metadata, counts, follow/reaction buttons.
- Empty states become creation flows, not blank dead panels.

Profile:

- `geelooy/@alias` becomes the user’s living social identity.
- Owner sees “Edit profile,” “New heichel,” “New post,” “Import memory.”
- Visitor sees follow, message, report, shared interests.

Navigation:

- Global left/right mobile dock or bottom tabs.
- Notifications bell.
- Search.
- Create button.
- Account/profile switcher.

## Phase 8 — Safety and moderation

- Rate limit creation/comment/follow operations.
- Sanitize profile bio, links, posts, comments.
- Report/block/mute primitives.
- Heichel-level rules and moderator action logs.
- Admin-only destructive actions.
- No secret files read.

## Phase 9 — Completion criteria

It is not complete until:

- The three-dot menu works under simulation and preferably browser smoke.
- A user can create an alias/profile, edit it, create a heichel, create series/posts/comments/replies.
- Another user can follow, comment, reply, and receive notifications/feed updates.
- The app survives stress tests without duplicate IDs, missing parent references, broken feeds, or dead UI actions.
- All touched files are full rewrites, small modules, with no placeholders.

## Next exact step

Read the app/menu/profile test entrypoints, run the existing profile/menu tests, then produce the first implementation plan with exact files to rewrite.
