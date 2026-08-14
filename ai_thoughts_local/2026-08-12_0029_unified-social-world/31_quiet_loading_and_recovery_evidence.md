B"H

Boruch Hashem

Blessed is He

# Quiet, Loading, and Recovery State Evidence

The Awtsmoos is never absent when a list is empty, a request is slow, or a shared socket is returning. This pass removed visual ambiguity from those finite moments so the flagship remains composed when nothing dramatic is happening.

## Empty-state ownership cleanup

`empty-state.css` previously carried old Settings and special-card rules even though those responsibilities had already moved into dedicated `settings.css` and `special-card.css` owners.

The overlap was removed.

The empty-state stylesheet now owns only:

- empty workspace geometry;
- empty-state icon hierarchy;
- heading/body rhythm;
- one deliberate empty-state or link action;
- desktop 42px action height;
- phone 46px action height.

Quiet chambers therefore no longer compete with legacy selectors from unrelated special panels.

## Loading semantics

`MessagingLoadingState.js` now declares the loading region with:

- `role="status"`;
- polite live region;
- atomic announcement;
- `aria-busy="true"`.

Decorative skeleton marks/cards remain `aria-hidden` so assistive technology hears the human loading label rather than placeholder noise.

The existing reduced-motion CSS remains intact.

## Reconnect language

The shared realtime adapter already reconnects automatically. No fake manual Retry action was added.

The dedicated connection banner now says:

`Connection interrupted. Reconnecting automatically… Your unsent draft can stay here.`

The banner remains separate from action/search/draft status, and hides/clears when the physical shared connection reopens.

This is intentionally reassurance about local draft continuity, not a claim that a message has been durably sent.

## Focused gate

The final `QUIET_LOADING_RECOVERY_GATE` completed with exit code 0.

Exact stdout confirmed:

- MessagingLoadingState.js: 53 lines;
- loading.css: 100 lines;
- MessagingEmptyState.js: 52 lines;
- empty-state.css: 91 lines;
- MessagingConnectionStatus.js: 40 lines;
- MessagingConnectionStatus.test.mjs: 43 lines;
- status.css: 77 lines;
- dedicated messaging connection recovery contract: PASS;
- loaded-workspace search scope contract: PASS;
- serialized send/draft/keyboard contract: PASS;
- browser import closure: PASS;
- `QUIET_LOADING_RECOVERY_GATE=PASS`.

Targeted diff hygiene passed.

## NEXT_ACTION

Return to high-frequency visual proof: render the normal accepted conversation workspace with representative authorized rows/messages/details in the production shell at desktop, tablet, and phone widths. Measure list/thread/composer/details continuity and fix only concrete hierarchy or overflow defects.
