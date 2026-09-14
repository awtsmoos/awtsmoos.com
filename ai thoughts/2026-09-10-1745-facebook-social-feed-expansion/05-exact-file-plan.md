B"H
Boruch Hashem
Blessed is He

# Exact File Plan — Community, Chat, Blog and Home Highlights

This is an implementation contract based on inspected native APIs, not hidden chain-of-thought.

> The Awtsmoos gives each feature its vessel and each vessel its shore;
> Awtsmoos.com lets Feed, Chat, Blog, comments, and identity meet without becoming one monolith anymore.

## Virtual OS files to create

- `community.html` — public/community landing shell.
- `communityConfig.js` — Heichel, series and canonical Awtsmoos URLs.
- `communityOriginPolicy.js` — first-party Awtsmoos detection and authenticated handoff.
- `communityApiTransport.js` — small JSON/form transport for native `/api/social` routes.
- `communityIdentityClient.js` — unified identity bootstrap and owned-alias selection.
- `communityFeedClient.js` — feed/blog/chat series reads and submitted-post writes.
- `communityPostModel.js` — normalizes native post details into rendering data.
- `communityFeedView.js` — feed card list and provenance rendering.
- `communityComposer.js` — mobile post/chat/blog composer state.
- `communityComposerView.js` — text/type/identity/image controls and pending confirmation.
- `communityMediaClient.js` — native asset upload/bind adapter.
- `communityCommentsClient.js` — native comments and submitted-comment adapter.
- `communityCommentsView.js` — inline comment list/composer.
- `communityModerationClient.js` — pending post/comment reads and approve/deny actions.
- `communityModerationView.js` — admin review queue shown only after server-proven authority.
- `communityApp.js` — orchestration only.
- `community-shell.css` — overall mobile-first layout.
- `community-feed.css` — posts/highlights/media cards.
- `community-composer.css` — bottom-safe composer.
- `community-comments.css` — comments and replies.
- `community-responsive.css` — narrow/mobile/tablet/desktop policy.
- `community-motion.css` — reduced-motion-safe futuristic transitions.
- `community.css` — import aggregator.

## Existing Virtual OS files to rewrite

- `pageNavigationData.js` — add Community destination.
- `navigationIconRegistry.js` — add community/chat icon only if needed by registry contract.
- `index.html` — add bounded social highlight section and Community portal card.
- `styles.css` — import home social highlight styling only if shared.
- `homeApp.js` — mount highlights without blocking Shabbos/event rendering.
- `sitemap.xml` — include Community route.
- `README.md` — document origin/auth/social architecture.

## Optional files after exact API proof

- `communityHighlightsView.js` — home card rendering.
- `communityHighlightsClient.js` — public/latest source adapter.
- `communityBootstrapView.js` — empty/unconfigured Heichel state and admin setup guidance.

## Native repository changes

Default: none for first social release. Existing identity, Heichel, posts, submitted posts, comments, submitted comments, assets and Social Hub messaging contracts are sufficient for the client.

Only add native Facebook import backend files after proving no existing external-import bridge already performs authorization, normalization and idempotent rich publication.

## Public-chat decision

The public `Living Chat` is a chat-shaped Heichel series whose ordinary messages are submitted posts and become visible only after native moderation. This satisfies the approval requirement. A separate `Private Awtsmoos Messages` action opens the mature Social Hub messaging client for consent-based private/group messaging.

## First-party identity decision

On `awtsmoos.com`, Community uses relative `/api/social` and the existing session. On `chabadofch.org`, public content remains visible where technically possible, while any authenticated mutation sends the visitor to the equivalent canonical Awtsmoos Community URL. No third-party-cookie workaround is introduced.

## NEXT_ACTION

Write the Facebook security/import contract, then read the exact navigation/home/native route files immediately before whole-file implementation.
