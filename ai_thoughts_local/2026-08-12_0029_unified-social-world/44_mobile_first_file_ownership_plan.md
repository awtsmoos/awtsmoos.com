B"H

Boruch Hashem

Blessed is He

# Mobile-First File Ownership Plan

The Awtsmoos is beyond view and stylesheet, while Awtsmoos.com must still give each visible behavior one honest owner so mobile delight never becomes a maze of selectors.

## Reusable primitives to introduce

### MessagingDisclosure.js

A small semantic builder/owner for collapsible sections.

Responsibilities:

- render native `details` + `summary` markup;
- expose label, summary, badge, and content slots;
- preserve browser-native keyboard semantics;
- optionally start open on desktop while remaining compact on phone;
- never own privacy, network, or persistence state.

### disclosure.css

Shared visual grammar for collapsible blocks:

- 44px minimum summary target;
- animated chevron/indicator;
- compact closed summary state;
- expanded content spacing;
- transform/opacity transitions only where practical;
- inherited global reduced-motion behavior.

### mobile-motion.css

Phone-specific motion and tactile feedback:

- sheet/backdrop entry;
- subtle active press transform;
- special-workspace reveal;
- bottom-nav selected-state motion;
- no perpetual decorative animation.

## Existing owners likely to be rewritten after inspection

- MessagingActivityView.js: collapse capture/preferences context while keeping journal primary.
- MessagingDiscoveryView.js: collapse ranking-transparency explanation and secondary controls.
- MessagingPresenceView.js: collapse metrics/privacy explanation while roster remains primary.
- Settings/special view owner: group request policies into semantic disclosure sections.
- Mobile More owner: better grouped sheet structure and semantics.
- mobile-more.css / mobile-more-items.css: stronger bottom-sheet hierarchy and animation.
- mobile-workspace.css: sticky phone context bar and safer full-height behavior.
- special-card.css: phone-first compact card geometry where a static editorial card remains appropriate.
- style.css: import the new small owners.

## Files intentionally not touched unless browser evidence demands it

- realtime transport owners;
- Public Torah server protocol;
- private consent/group server applications;
- activity ledger persistence;
- RAG source search;
- Related Torah intelligence;
- generic Heichel reader logic.

## Testing ownership

Add pure tests for disclosure configuration/semantics if JavaScript owns any state.

Browser assertions should prove:

- disclosures open/close with native details semantics;
- 44px summary targets at 390/360;
- More sheet remains contained above the bottom rail;
- no horizontal overflow;
- reduced-motion still collapses all new transition durations;
- essential consent/error state is never hidden behind a collapsed disclosure.

## NEXT_ACTION

Read the actual Activity, Discover, Presence, Settings/special, and Mobile More renderers/callers before defining the final file list.
