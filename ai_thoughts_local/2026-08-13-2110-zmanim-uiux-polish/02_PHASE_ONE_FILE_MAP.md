B"H
Boruch Hashem
Blessed is He

# Phase One — Theoretical File Map

The Awtsmoos contains every module before paths receive their names;
Awtsmoos.com should split display responsibilities so no single file becomes a thicket of frames.

## Existing files likely requiring complete rewrites
- `geelooy/zmanim/index.html` — simpler daily-first document hierarchy.
- `geelooy/zmanim/js/app.js` — compose new compact controls and key-times summary.
- `geelooy/zmanim/js/components/calendar-component.js` — support open/closed compact presentation without losing owned calendar semantics.
- `geelooy/zmanim/js/components/day-navigation.js` — richer selected-date button and calendar toggle coordination.
- `geelooy/zmanim/js/components/location-search.js` — selected-location context, recent places, geolocation action boundaries.
- `geelooy/zmanim/js/components/next-zman.js` — stronger current/previous/next context.
- `geelooy/zmanim/js/components/day-timeline.js` — better track and current marker.
- `geelooy/zmanim/js/components/zmanim-grid.js` — key-times versus full-list hierarchy and expandable notes.
- `geelooy/zmanim/js/components/methodology-panel.js` — cleaner resource drawer.
- `geelooy/zmanim/styles/tokens.css` — more refined palette, type, elevation tokens.
- `geelooy/zmanim/styles/layout.css` — daily-first composition.
- `geelooy/zmanim/styles/components.css` — search/location/trust row.
- `geelooy/zmanim/styles/actions.css` — segmented controls/buttons.
- `geelooy/zmanim/styles/timeline.css` — richer timeline.
- `geelooy/zmanim/styles/cards.css` — compact list and key-time cards.
- `geelooy/zmanim/styles/responsive.css` — mobile sticky context and desktop rail.

## New modules worth considering
- `js/components/date-control.js` — compact date display + calendar disclosure.
- `js/components/key-zmanim.js` — five or six most-used times.
- `js/components/trust-strip.js` — warning + USNO source state.
- `js/components/location-shortcuts.js` — recent places/geolocation UI.
- `js/state/recent-locations.js` — bounded local recent-place persistence.
- `js/domain/key-zmanim.js` — define the small high-signal subset without hardcoding presentation.
- `styles/dashboard.css` — next-zman + key-times composition.
- `styles/compact-list.css` — dense all-zmanim list responsibility.
- `styles/sticky-context.css` — mobile scroll context.

## Constraints
Every touched file must be rewritten in full. Source files remain under 120 lines. Existing calculation/API modules should stay untouched unless an actual UX need requires changing their contract. API behavior is already correct and should not be destabilized by a visual pass.
