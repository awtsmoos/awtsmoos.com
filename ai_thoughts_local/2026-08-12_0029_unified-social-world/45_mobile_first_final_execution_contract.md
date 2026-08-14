B"H

Boruch Hashem

Blessed is He

# Mobile-First Final Execution Contract

The Awtsmoos is beyond dense and spacious, while Awtsmoos.com must reveal one clear next action at a time. This phase makes the flagship feel native to a phone without turning privacy, consent, or system state into hidden decoration.

## Files to create

- `MessagingDisclosure.js` — reusable native-details disclosure vessel.
- `disclosure.css` — shared disclosure geometry, summary target, chevron, expanded content rhythm.
- `mobile-motion.css` — phone workspace/sheet/tap motion language inherited by global reduced-motion law.
- `MessagingMobileMoreMotion.js` — finite More-sheet open/close state owner with no routing authority.
- `MessagingDisclosure.test.mjs` — semantics/default-state contract.
- `MessagingMobileMoreMotion.test.mjs` — opening/closing state contract if the motion owner exposes pure timing/state behavior.

## Files to rewrite

- `MessagingActivityView.js` — journal stays primary; capture/privacy preferences become a compact disclosure.
- `MessagingDiscoveryHeader.js` — title/status stay primary; ranking explanation and reversible mode control become a transparency disclosure on phone.
- `MessagingPresenceParts.js` — visible roster stays primary; counts/privacy context gain a compact disclosure wrapper.
- `MessagingMobileMoreMenu.js` — grabber, grouped destinations, motion owner, truthful open/close state.
- `mobile-more.css` — bottom-sheet elevation/backdrop/entry/exit hierarchy.
- `mobile-more-items.css` — clearer grouped tap rows, stronger active state, 44px+ targets.
- `mobile-workspace.css` — sticky contextual special header and tighter phone spacing.
- `activity.css` / `discovery.css` / `presence.css` — mobile-first density tuned around disclosure primitive.
- `style.css` — import the new disclosure/motion owners.

## Default disclosure choices

- Activity capture/privacy: open on wide screens, collapsed on phones.
- Discover ranking transparency: open on wide screens, collapsed on phones, current mode still visible in summary.
- Online metrics/privacy: open on wide screens, collapsed on phones, visible roster immediately below.

Because static `details[open]` cannot change automatically only by CSS, the builder will use viewport-aware initial open state at render time without persisting it as authorization or user identity state.

## Motion contract

- More backdrop fades.
- More sheet rises/falls from bottom using transform + opacity.
- Special workspace content gets a subtle enter animation.
- Bottom-nav buttons receive press feedback.
- Disclosure indicator rotates.
- No endless decorative motion.
- Global `accessibility-motion.css` remains the final Gevurah: all new motion must collapse when reduced motion is requested.

## Safety contract

Must not change:

- Public Torah publication protocol.
- Private consent logic.
- Presence projection rules.
- Activity data retention/privacy.
- Recommendation endpoint payloads.
- Shared realtime transport.
- Related Torah observer/RAG behavior.

## Browser proof

At minimum on 390px and 360px:

- disclosures render with 44px+ summaries;
- closed disclosures materially reduce vertical footprint;
- native details open/close semantics work;
- Activity journal remains visible when privacy details are collapsed;
- Discover candidates remain visible when transparency details are collapsed;
- Online roster remains visible when metrics are collapsed;
- More sheet opens above bottom nav, remains contained, and closes without overflow;
- reduced-motion emulation removes new animations/transitions;
- no horizontal overflow.

Desktop/tablet regression:

- disclosures default open so existing information density is preserved;
- existing rail/list/thread/Public Torah layout remains unchanged.

## Final gate

After browser proof, rerun:

- disclosure/motion focused tests;
- browser import closure;
- flagship source custody;
- existing UI/accessibility/social universe;
- targeted diff hygiene.

## NEXT_ACTION

Implement the reusable disclosure and More motion owners first, then rewrite Activity/Discover/Presence to consume them, then style and browser-test the phone experience.
