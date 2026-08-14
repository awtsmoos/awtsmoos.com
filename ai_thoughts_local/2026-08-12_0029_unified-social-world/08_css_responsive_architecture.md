B"H

Boruch Hashem

Blessed is He

# Phase One — CSS and Responsive Architecture

The Awtsmoos fills every measure without being confined by any measure; Awtsmoos.com should likewise preserve one visual language while each viewport receives the vessel it actually needs.

## Desktop model
- Narrow high-level rail for communication sections and active identity.
- Searchable list pane for the selected section.
- Main workspace for thread, Torah discussion, mail reference, activity, or discovery.
- Optional details pane that can collapse independently.
- Information density should come from useful hierarchy, not decorative noise.

## Mobile model
- Treat list and thread as distinct navigation states rather than shrinking all desktop panes.
- Use a compact header and bottom navigation or equivalent touch-first section access.
- Keep composer sticky and safe-area aware.
- Put details, members, filters, and secondary actions into sheets/drawers.
- Preserve back navigation and keyboard usability.

## CSS module boundaries
When current files permit, split styles by responsibility:
- foundations/tokens;
- application shell and panes;
- navigation/list rows;
- conversation/thread content;
- Public Torah source search/cards;
- presence and status;
- request/friend/group controls;
- sheets/modals/tooltips;
- responsive/mobile overrides;
- accessibility/focus/reduced-motion rules.

No single style file should become a dumping ground. Existing naming conventions will be preserved unless a fully compatible migration is proven.

## State quality
Every primary surface needs intentional selected, hover, focus, unread, loading, empty, reconnect, disabled, and error states. Presence and unread state must not rely on color alone.

## Responsive proof widths
Measure actual DOM geometry and overflow at approximately 1440, 900, 768, 640, 430, 390, and 360 CSS pixels. Screenshots supplement but do not replace DOM/runtime assertions.
