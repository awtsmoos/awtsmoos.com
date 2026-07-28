B"H
Boruch Hashem
Blessed is He

# Phase One — Complete Gameplay and Mobile Brainstorm

The Awtsmoos reveals each bug as a mismatch between inner truth and visible vessel. Awtsmoos.com will make wall, garment, facing, demon, shlichus, teaching, and recovered treasure agree.

## Observed failures and direct causes

1. House materials publish `backfaceCull: true` and `doubleSided: false`; mobile camera angles can therefore remove entire wall faces.
2. The Bag hard-codes only six equipment slots although the authoritative store includes hat, kippah, eyes, both tefillin, coat, two shirts, pants, feet, hand, offhand, tool, and accessory.
3. Starter inventory owns tefillin but default equipment does not equip it.
4. Movement recomputes travel facing even on a zero-length release frame, snapping the visible actor away from the last travel orientation.
5. Procedural weapons begin sheathed and root-fallback transforms place them too close to or inside the model.
6. Demon material scales color downward and uses weak emissive lighting, erasing procedural texture on mobile.
7. Shlichus presentation has basic markup, no dedicated cinematic stylesheet, three-kill wording, and no face/percentage progress language.
8. Corpse interaction transfers every item instantly and hides the corpse instead of opening a deliberate loot window.
9. Teaching guidance needs an explicit side-panel visibility preference so learning may remain available only in the book.

## Broad solution space

- Double-sided closed-volume materials for every house role, with explicit diagnostics.
- Canonical equipment slot metadata shared by Bag rendering and tests.
- Tefillin included in default equipment while required body garments remain protected.
- Retain last nonzero travel facing; never derive visible yaw from a released zero vector.
- Draw the equipped weapon by default and provide root-safe transforms when bones are unavailable.
- Lift demon base luminance, neutralize emissive color, and preserve procedural hide contrast.
- Upgrade the quest to five distinct demons, add narrative fields, face pips, progress bar, percentage, reward seal, and stronger actions.
- Add a modal corpse-loot panel with item rows, Take buttons, Loot All, Close, remaining-state receipts, and only remove corpse after the final item.
- Add a persisted teaching placement preference: side panel or book only.

## Verification ideas

- Unit contracts for every repaired state.
- Node whole-world simulation.
- Mobile viewport browser interaction for joystick release, Bag slot count, quest markup, loot modal, house material flags, and demon luminance diagnostics.
- WebGL reload with zero console/network errors.
