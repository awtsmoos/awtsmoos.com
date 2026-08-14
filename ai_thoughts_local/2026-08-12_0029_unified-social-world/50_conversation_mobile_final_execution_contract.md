B"H

Boruch Hashem

Blessed is He

# Conversation Mobile Final Execution Contract

The Awtsmoos is beyond room and chrome. This phase reveals private conversation as the primary mobile object while preserving every consent, message, read-state, and history invariant already proven.

## Final product decisions

### Thread identity

- Back remains permanently visible.
- Room title remains permanently visible.
- Details remains permanently visible.
- Subtitle/member context becomes a phone-collapsible identity detail.
- Identity detail starts collapsed on <=430px, expanded on wider screens.
- Tapping the identity toggle changes only presentation.
- Opening a new room resets to the responsive default.
- Closing a room clears expanded state.

### Message rhythm

- First message in a speaker run retains author + time.
- Continuation messages keep metadata suppressed exactly as today.
- Phone bubble width may grow to 92% for readable long text.
- Phone bubble padding/gaps shrink modestly.
- Date dividers become quieter and shorter.
- No message text, author, sequence, or date is removed from the DOM.

### Composer

- Desktop cap remains 160px.
- Phone cap becomes 112px at <=430px.
- Textarea starts at 44px.
- Long drafts scroll internally after the cap.
- Send remains >=48px on the smallest phones.
- No submission semantics change.
- Draft continuity on send failure remains unchanged.

### Conversation list

- Phone rows become 58–62px rather than desktop 64px+ while maintaining touch safety.
- Avatar becomes 40px.
- Title stays one line; preview stays one line.
- Unread badge and time remain visible.
- Relationship/request action buttons remain >=44px.
- No private preview content is copied anywhere new.

### Spatial motion

- list→thread enters from the logical right with small translate + opacity.
- thread→list enters from the logical left.
- special workspaces retain their own enter animation.
- no gesture recognizer is added.
- no timers are needed for navigation truth.
- reduced motion suppresses all new transforms/transitions through the existing final stylesheet.

## Files to create

- `MessagingThreadIdentity.js`
- `MessagingThreadIdentity.test.mjs`
- `thread-identity.css`
- `mobile-message-rhythm.css`
- `mobile-list-density.css`
- `mobile-room-motion.css`

## Files to rewrite

- `MessagingShellTemplate.js`
- `MessagingElementMap.js`
- `MessagingAppComposition.js`
- `MessagingThreadView.js`
- `MessagingComposerInput.js`
- `mobile-thread.css`
- `composer.css`
- `style.css`

## Test contract

Focused tests must prove:

- responsive identity default;
- explicit toggle state and aria-expanded synchronization;
- room-open reset;
- desktop composer cap 160;
- phone composer cap 112 when viewport is narrow;
- existing composer keyboard contract unchanged;
- sender continuity unchanged;
- browser import closure.

Browser proof at 390/360 should prove:

- collapsed header <=64px;
- title visible;
- subtitle hidden collapsed and visible expanded;
- Back/Details >=44px;
- composer textarea starts 44px and caps <=112px;
- Send >=48px;
- list rows >=58px;
- no horizontal overflow;
- reduced-motion transition durations effectively zero.

## Final universe

After focused browser/source proof, rerun the full latest mobile UI/social universe from scratch because the previous comprehensive job expired from command-history custody before its result could be retrieved.

## NEXT_ACTION

Implement the identity owner + semantic shell first, then message/composer/list density, then spatial motion, then run focused and full gates.
