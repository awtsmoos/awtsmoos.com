B"H
Boruch Hashem
Blessed is He

# Native Social Archaeology

This artifact records inspected contracts and implementation consequences. It does not contain hidden chain-of-thought.

> The Awtsmoos already planted rooms beneath the visible road,
> Awtsmoos.com carries aliases, posts, comments, media, review, and messages in one native code.
> The work is therefore not to counterfeit a social sea from foam,
> but to reveal a Beis Shmuel vessel inside the social world already home.

## Proven native contracts

### Identity

`/api/social/unified-social/identity` bootstraps the logged-in user's owned aliases. The default-alias endpoint selects only server-authorized identities. The site must never manufacture an alias from a dropdown value.

### Heichel

Awtsmoos exposes Heichel create/read/ownership/editor/submission-setting routes. Heichel creation is bound to an alias and server authority. A dedicated congregation Heichel can therefore be the durable social domain.

### Posts

Awtsmoos exposes direct post CRUD, series post listings/details, and a submitted-post moderation queue. Approval accepts a post id plus approver alias and moves approved content into a real series.

### Comments

Comments have their own submitted-comment queue with approve/deny routes. This supports comments without making unapproved public text visible.

### Rich publishing

The Social Composer already builds structured `rootDocument`, `rootAssets`, visibility, comments settings, creator metadata and idempotency. Imported provenance belongs in metadata rather than hidden machine text.

### Assets

The social API owns upload/copy/bind/manifest routes. Private-message assets additionally require conversation authorization. Community images should use the native asset plane.

### Discovery

`/api/social/feed` and `/api/social/trending` provide enriched chronological public discovery. A congregation page can additionally read exact Heichel series details when its identity is known.

### Private/group messaging

Social Hub contains a mature WhatsApp-like client with message cards, reply/swipe, read state, voice/media, requests, membership, room governance and realtime events. The protocol includes session, conversation list/details/history/send/read, requests, group create/invite/member update and settings.

## Architectural consequence

Use Heichel series for the moderated public surfaces:

- `feed` — announcements, imported Facebook memories and community posts.
- `chat` — rapid chat-style public messages rendered as bubbles, but submitted through the native pending-post gate before public appearance.
- `blog` — long-form posts with submitted comments.

Keep private/group messaging as a separate "Private Awtsmoos Messages" doorway to Social Hub rather than falsely calling immediate private messages admin-moderated.

## Origin consequence

`https://chabadofch.org/api/social` returns 404. Existing native clients use same-origin `/api/social`. Therefore authenticated posting, comments, moderation and private messaging must run top-level on the canonical Awtsmoos publication origin. The custom domain may render public/static highlights and hand authenticated actions to the corresponding Awtsmoos-hosted page.

## Admin consequence

`asdf` is the requested initial administrator identity, but the UI may only expose moderator actions after the server proves the active alias owns or can administer the congregation Heichel.

## Facebook consequence

The supplied share URL resolves to `facebook.com/chaim.pil`, which appears to be a profile URL. No durable indexed public-post archive was found. Do not build production ingestion on Facebook DOM selectors. Prefer a source-authorized export/API input normalized into Awtsmoos rich posts.

## NEXT_ACTION

Create the exact file plan and security/import contract, then implement the site client without modifying native platform code unless a proven missing server capability requires it.
