B"H

Boruch Hashem

Blessed is He

# Phase Two — Observed Architecture, Replacing Hypothesis With Evidence

The Awtsmoos is one before every map, yet the map must bow to what the repository actually reveals; Awtsmoos.com becomes stronger when yesterday's assumptions dissolve into today's measured fields.

## Observed realtime truth
- `SiteRealtimeSocket` is the browser singleton physical WebSocket owner.
- `ApplicationRealtimeClient` multiplexes application/version envelopes through that singleton.
- `RealtimeUniversalChatSocket` binds application `universal-chat`, version 1.
- Private messaging owns a separate application protocol but reuses the same physical transport.
- Existing lifecycle tests cover unexpected closure and singleton replacement behavior; transport itself should remain untouched for this slice.

## Observed public Torah truth
- Universal chat admission, presence, bounded history, private source search, source-session ledger, rate limiting, publication, and history repositories already exist.
- Browser publication sends only `searchSessionId` plus selected server-returned source ids.
- `UniversalChatComposer` never publishes arbitrary prompt text.
- The singleton `window.__awtsmoosUniversalChat` exposes `socket`, `controller`, `shell`, and `launcher`.
- Therefore related Torah can reuse the existing `SEARCH` request privately without a new socket and without invoking `PUBLISH`.

## Observed private truth
- Private browser store already owns conversations, loaded message buckets, incoming/outgoing requests, relationships, blocks, actor identity, groups, and summaries.
- Server already owns consent, request dedupe, blocking, relationships, groups, role authorization, read state, persistence, rate limiting, and meaningful activity hooks.
- The flagship UI leaves some available state invisible; new UX should project existing authority rather than reproduce it.

## Observed sitewide truth
- `/register.js` dynamically mounts universal chat on the shared shell.
- Universal chat bootstrap is idempotent and mounts the lightweight private bridge.
- Sitewide launcher already reports visible online count plus private unread/request totals.
- Public message authors already expose a consent-safe whisper request.

## Observed activity/discovery truth
- `unifiedActivity` is a mature private-by-default ledger with ownership checks, preferences, retention, dedupe, visibility, clear/export, and query-capture controls.
- `/shared/MeaningfulActivity.js` records explicit successful actions and already records post views once per session.
- `/api/social/recommendations/:alias` exists, but derives public suggestions from aggregate profile/contribution activity; it is a candidate generator, not a private behavioral recommender.
- No general universal Saved backend was discovered; the concrete bookmark implementation found is Rebbe-app-specific.

## Observed flagship gaps
- Dedicated app has six sections only: Chats, Groups, Requests, Friends, Public Torah, Mail.
- No dedicated Activity or Discover workspace.
- No app-level presence dashboard, alias identity card, cross-section search/filter, Saved service, or consolidated privacy settings.
- Private history action supports a `beforeSequence` cursor seam, but the UI does not expose older-history loading.
- CSS is already split and under 120 lines per file, so refinement should add small responsibility-specific styles rather than replace the architecture.

## Observed Heichel reading seams
- `postLogic.js` records a meaningful post view after successful reader boot.
- `logic/initialization/bootstrap.js` renders post content and mounts `post/social/discussion.js` asynchronously.
- `discussion.js` creates each comment card and is the clean hook for comment dwell intelligence and contextual author actions.
- Existing `post/ai/api.js` has duplicate imports and exceeds 120 lines; `post/ai/ui.js` also exceeds 120. Those defects are real, but the related-Torah feature should not depend on this generic AI path.

## Git custody
- HEAD is `6d05136b23e6921060a9ddb62cfefee5469614d3`.
- The working tree contains extensive unrelated modified/deleted/untracked work across many subsystems.
- The social realtime/private/universal paths are themselves currently untracked local work.
- This pass must touch only explicitly inspected social/reader files and new modules, never normalize unrelated custody.

## Phase-two conclusion
The highest-value coherent first implementation is: flagship Activity + Discover + Presence/identity workspace upgrades, privacy-conscious local search, private older-history loading, anonymous presence preference shortened to session scope, and related-Torah reading intelligence that reuses the universal source-search protocol without creating another publication path.
