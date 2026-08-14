B"H

Boruch Hashem

Blessed is He

# Phase Three — Final First-Pass Execution Contract

The Awtsmoos is the indivisible source; this contract divides work only so every line on Awtsmoos.com can be inspected, verified, and returned to unity without hidden debt.

## First-pass product slice
Deliver one coherent vertical expansion with five visible outcomes:
1. Flagship workspace gains Activity, Discover, Online, Settings-aware identity/presence, scoped search, and true mobile list/thread navigation.
2. Private accepted conversations gain bounded “Load older” paging with dedupe and scroll anchoring.
3. Anonymous presence hiding becomes session-scoped while authenticated server authority remains unchanged.
4. Heichel posts/comments gain meaningful-dwell Related Torah using the existing universal-chat private SEARCH protocol only.
5. Comment rendering loses the unsafe alias HTML interpolation while retaining reactions/replies.

## New flagship JavaScript files
- `geelooy/apps/universal-chat/MessagingSectionCatalog.js` — section labels/icons/privacy classifications.
- `geelooy/apps/universal-chat/MessagingShellTemplate.js` — static shell markup with identity, presence, workspace search, mobile back, older-history target.
- `geelooy/apps/universal-chat/MessagingIdentityView.js` — alias/Ploni/hidden status renderer.
- `geelooy/apps/universal-chat/MessagingPresenceView.js` — trusted universal presence projection listener/renderer.
- `geelooy/apps/universal-chat/MessagingActivityClient.js` — owner activity timeline fetch using existing route.
- `geelooy/apps/universal-chat/MessagingActivityView.js` — private semantic timeline renderer.
- `geelooy/apps/universal-chat/MessagingDiscoveryClient.js` — public recommendation candidate fetch plus owner activity fetch.
- `geelooy/apps/universal-chat/MessagingDiscoveryRanker.js` — local ranking, diversity, explanation, session reset.
- `geelooy/apps/universal-chat/MessagingDiscoveryView.js` — accessible For You renderer.
- `geelooy/apps/universal-chat/MessagingWorkspaceSearch.js` — scoped filtering of loaded authorized summaries/metadata.
- `geelooy/apps/universal-chat/MessagingWorkspaceSections.js` — Public Torah/Mail/Activity/Discover/Online/Settings delegate.
- `geelooy/apps/universal-chat/MessagingStoreRefresh.js` — small store event refresh coordinator.
- `geelooy/apps/universal-chat/MessagingMobileNavigation.js` — mobile list/thread state and back behavior.
- `geelooy/apps/universal-chat/MessagingHistoryPager.js` — older private history paging/scroll anchor coordinator.

## Whole-file flagship rewrites
- `MessagingAppShell.js`
- `MessagingAppComposition.js`
- `MessagingAppController.js`
- `MessagingSectionPolicy.js`
- `MessagingSectionController.js`
- `MessagingConversationActions.js`
- `MessagingConversationController.js`
- `MessagingThreadView.js`
- `geelooy/scripts/awtsmoos/social/privateMessaging/PrivateMessagingStore.js`
- `geelooy/scripts/awtsmoos/social/universalChat/presenceState.js`
- `geelooy/apps/universal-chat/style.css`

## New flagship CSS files
- `workspace.css`
- `activity.css`
- `discovery.css`
- `presence.css`
- `mobile-workspace.css`

Existing `layout.css`, `components.css`, and `responsive.css` remain untouched in first pass because they are already responsibility-scoped and near enough to the line ceiling that new behavior belongs in new files.

## New Heichel intelligence files
- `geelooy/heichelos/post/intelligence/RelatedTorahContext.js` — bounded post/comment semantic context and substantial-English eligibility.
- `geelooy/heichelos/post/intelligence/MeaningfulReadingObserver.js` — dwell/intersection lifecycle.
- `geelooy/heichelos/post/intelligence/RelatedTorahSearch.js` — universal singleton SEARCH-only request, dedupe, session cache.
- `geelooy/heichelos/post/intelligence/RelatedTorahView.js` — safe source-card renderer and style loader.
- `geelooy/heichelos/post/intelligence/RelatedTorahActivity.js` — source-open meaningful activity without query/body duplication.
- `geelooy/heichelos/post/intelligence/PostReadingIntelligence.js` — post coordinator.
- `geelooy/heichelos/post/intelligence/CommentReadingIntelligence.js` — comment coordinator.
- `geelooy/heichelos/post/intelligence/related-torah.css` — responsive contextual card styling.
- `geelooy/heichelos/post/social/CommentReactions.js` — reaction API/state/UI.
- `geelooy/heichelos/post/social/CommentCard.js` — safe author/body/actions rendering and comment intelligence hook.

## Whole-file Heichel rewrites
- `geelooy/heichelos/post/postLogic.js`
- `geelooy/heichelos/post/social/discussion.js`

## Explicit non-touched boundaries
- Shared physical realtime transport files.
- Universal/private server authorization cores.
- Public source publication handler/session validation.
- Mail body persistence.
- Generic overlong `post/ai/api.js` and `post/ai/ui.js` unless tests prove they block this slice.
- Public profile/recommendation server files, which are already over 120 lines and need a dedicated refactor before modification.
- No universal Saved implementation in this pass because no canonical storage authority was discovered.

## First-pass tests to add after all source writes
- `MessagingSectionPolicy.test.mjs`
- `MessagingDiscoveryRanker.test.mjs`
- `MessagingHistoryPager.test.mjs`
- `RelatedTorahContext.test.mjs`
- `RelatedTorahSearch.test.mjs`
- `presenceState.test.mjs`

## Existing regression evidence to rerun
- social browser import closure;
- shared realtime lifecycle/reconnect;
- public history/index/security/search-timeout/presence contracts;
- private consent/groups/request-dedupe contracts;
- meaningful activity preference/comment contracts;
- dedicated reconnect status;
- live RAG/WebSocket integration;
- MitzvahWorld shared-social browser proof.

## Browser proof contract
At 1440, 900, 768, 640, 430, 390, and 360 CSS px prove through DOM/runtime evaluation:
- expected sections mounted;
- no document horizontal overflow;
- mobile list/thread transition and back control;
- search accessible label and filtering;
- Online/presence state uses the universal singleton;
- Activity owner gating;
- Discover signed-out versus alias-aware behavior;
- Public Torah still source-only;
- physical WebSocket singleton identity unchanged;
- related Torah does not create a second physical socket;
- reconnect banner recovers calmly.

## Completion discipline
After first source pass: syntax/import/line checks. After failures: whole-file correction pass. Then actual server readiness on 8080, live RAG/public source selection/publication/presence/reconnect, browser proof, touched-file reread, planned-vs-actual delta, final residual/handoff docs. No claim of full prompt completion unless REMAINING_WORK is actually empty.

## NEXT_ACTION
Begin first source pass with new leaf modules, then rewrite coordinators around them. No tests until that complete first implementation pass is written.
