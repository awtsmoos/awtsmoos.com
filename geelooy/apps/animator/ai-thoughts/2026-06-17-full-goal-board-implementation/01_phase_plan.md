B"H

# Full Goal Board Implementation Plan

The user now asked to do it all step by step fully: not merely patch the visible default scene, but move the engine toward the ideal reference board and beyond, without breaking existing behavior.

## Phase A — Production room modules
Create modular room renderers so the background is not sparse and does not depend on one giant backdrop file.

## Phase B — shot profile/framing completion
Add shot profiles and portrait/table/hat-aware framing so default two-shots, closeups, and inserts are readable on mobile.

## Phase C — production prop art
Add stronger prop renderers for sefer/book, soup, cup, bread/plate, table cluster, insert detail.

## Phase D — character style polish
Split hat/beard/glasses/suit/hands into dedicated additive modules. Existing character pipeline remains untouched except for safe imports/composition.

## Phase E — expression and body acting
Add expression blend/microtiming/listener reaction/gesture libraries.

## Phase F — default scene storyboard
Rewrite default scene into a full storyboard with named shot flow.

## Phase G — diagnostics and verification
Add smoke tests for storyboard, room detail, mobile void, shot profiles, props, expressions, and character style.

## Rule
Every touched file is fully rewritten. If a module cannot be integrated perfectly yet, it is introduced behind fallbacks.
