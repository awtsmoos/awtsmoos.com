B"H

Boruch Hashem

Blessed is He

# Phase Two — Refined Candidate File Plan

The Awtsmoos has no fragmentation, yet Awtsmoos.com needs many small vessels so each responsibility can be tested, replaced, and understood without shaking the whole sea.

## Flagship app: new modules
- `geelooy/apps/universal-chat/MessagingIdentityView.js` — current alias/Ploni/hidden/realtime status projection.
- `geelooy/apps/universal-chat/MessagingPresenceView.js` — trusted site/context counts and visible roster from universal presence events.
- `geelooy/apps/universal-chat/MessagingActivityClient.js` — owner identity verification + private ledger GET/preferences bridge.
- `geelooy/apps/universal-chat/MessagingActivityView.js` — accessible activity timeline and privacy-aware empty/loading/error states.
- `geelooy/apps/universal-chat/MessagingDiscoveryClient.js` — public recommendation candidates plus private owner activity inputs.
- `geelooy/apps/universal-chat/MessagingDiscoveryRanker.js` — local explanations/diversity/recent-interest projection without sending private history away.
- `geelooy/apps/universal-chat/MessagingDiscoveryView.js` — For You cards and reset/disable/session controls.
- `geelooy/apps/universal-chat/MessagingWorkspaceSearch.js` — local authorized metadata filtering across loaded sections.
- `geelooy/apps/universal-chat/MessagingHistoryPager.js` — private `beforeSequence` loading and scroll preservation.

## Flagship app: likely whole-file rewrites
- `MessagingAppComposition.js` — compose new views/services without inflating controllers.
- `MessagingAppController.js` — route new sections and shared refresh state.
- `MessagingAppShell.js` — richer header/search/identity/presence targets.
- `MessagingSectionPolicy.js` — Activity/Discover/Settings policy metadata.
- `MessagingSectionController.js` — delegate new special sections, search, and refresh.
- `MessagingSpecialView.js` — Public Torah, Mail, Activity, Discover, Settings delegation only if still under ceiling after split.
- `MessagingConversationController.js` — connect older-history pager if a small delegated hook fits.
- `style.css` — import newly split style modules.
- New `workspace.css`, `activity.css`, `discovery.css`, `presence.css` — responsibility-specific design.
- `responsive.css` only if real measured geometry requires it; otherwise add `mobile-workspace.css` to avoid ceiling pressure.

## Presence privacy
- `geelooy/scripts/awtsmoos/social/universalChat/presenceState.js` — anonymous hide moves from long-lived `localStorage` to session storage while authenticated server persistence remains the source of truth.

## Heichel reading intelligence: new modules
- `geelooy/heichelos/post/intelligence/RelatedTorahContext.js` — bounded normalized post/comment context and English/substance checks.
- `geelooy/heichelos/post/intelligence/RelatedTorahSearch.js` — singleton universal `SEARCH` reuse, pacing, dedupe, session cache, never `PUBLISH`.
- `geelooy/heichelos/post/intelligence/RelatedTorahView.js` — text-safe source cards, accessible loading/error/empty states.
- `geelooy/heichelos/post/intelligence/MeaningfulReadingObserver.js` — dwell timers + IntersectionObserver with cancellation.
- `geelooy/heichelos/post/intelligence/RelatedTorahActivity.js` — meaningful source-open ledger event without prompt/comment body.
- `geelooy/heichelos/post/intelligence/PostReadingIntelligence.js` — post-level coordinator.
- `geelooy/heichelos/post/intelligence/CommentReadingIntelligence.js` — per-comment coordinator.
- `geelooy/heichelos/post/intelligence/related-torah.css` — unobtrusive responsive cards.

## Heichel likely whole-file rewrites
- `geelooy/heichelos/post/postLogic.js` — start post reading intelligence after successful `ignite()` without delaying core reader.
- `geelooy/heichelos/post/social/discussion.js` — safe text-node author header, contextual author menu, comment intelligence hook.

## Explicitly not touched in first implementation
- `SiteRealtimeSocket`, `RealtimeConnection`, universal/private server permission core.
- Generic `post/ai/api.js` and `post/ai/ui.js` unless direct browser import failure proves they block this feature; their >120-line/duplicate-import debt remains logged.
- Mail persistence.
- Universal Saved backend.

## Required pre-write reads still outstanding
Re-read exact contents of the flagship coordinator/policy files, `presenceState.js`, `postLogic.js`, `discussion.js`, and private history store semantics immediately before writing. New files require no pre-existing content but must only import already-inspected contracts.
