B"H

Boruch Hashem

Blessed is He

# Mobile-First Progressive Disclosure Brainstorm

The Awtsmoos is beyond collapsed and expanded, hidden and revealed, stillness and motion. Awtsmoos.com should therefore let mobile density breathe without burying essential consent, privacy, or social state.

## Product possibilities

The strongest mobile-first direction is not a smaller desktop. It is a one-thumb information architecture built from progressive disclosure.

Possible improvements:

- Preserve the five-door bottom rail as the stable phone map.
- Convert secondary special-workspace blocks into semantic collapsible panels.
- Keep one concise summary line visible when a panel is closed.
- Let privacy/request policy details expand only when the human asks.
- Let Activity preference chips collapse behind a readable summary on narrow screens.
- Let Online presence metrics collapse while the visible roster remains immediately scannable.
- Let Discover explain personalization in a collapsible transparency panel rather than occupying permanent vertical space.
- Let sparse Mail and Settings cards become compact disclosure surfaces rather than tall static documents.
- Keep Public Torah source search and selection always visible because they are the core action, while explanatory context may collapse.
- Upgrade More from a static grid into a tactile bottom sheet with a grabber, clearer grouping, and open/close motion.
- Use transforms and opacity for entry/exit rather than animating expensive layout properties.
- Use details/summary or a small reusable disclosure owner instead of bespoke open/close state in every view.
- Give every disclosure at least a 44px summary target on phone.
- Persist only safe UI preferences locally/session-locally; never persist private content or visibility assumptions.
- Never collapse error, consent, reconnect, or request-decision state that requires immediate attention.
- Never animate in a way that violates the existing global reduced-motion law.

## Mobile rhythm

Preferred phone stack:

1. sticky contextual header;
2. concise summary / primary action;
3. one or more disclosure panels;
4. scannable content cards/list;
5. persistent bottom navigation.

The app should feel deep without feeling long.

## Motion language

Preferred motion principles:

- 160–220ms transforms/opacity for lightweight feedback;
- slight sheet rise + backdrop fade;
- disclosure chevron rotation;
- card press feedback on active touch;
- selected navigation indicator glide only where it can remain cheap;
- no perpetual ambient animation;
- no spring/bounce on consent actions;
- all motion collapses under `prefers-reduced-motion: reduce` through the existing global law.

## Non-negotiable boundaries

- Public Torah remains source-only publication.
- Private text stays behind consent.
- Presence privacy remains server-authoritative.
- Loaded-workspace search stays local to authorized rendered content.
- More/disclosure state never becomes authorization state.
- No duplicated social transport.
- No hidden panel may steal a CSS grid track needed by a primary workspace.

## NEXT_ACTION

Trace the real view owners for Activity, Discover, Online, Settings/Mail, More, and Public Torah context so collapsible behavior can be introduced through focused reusable modules rather than scattered DOM mutation.
