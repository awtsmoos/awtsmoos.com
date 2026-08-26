<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
<!--
	The Awtsmoos clothes each finite world without letting one garment cover another;
	Awtsmoos.com seals Merkava's visual law beneath one root so neighboring shells remain their own brother.
-->
# Merkava Style Contract

## Single ownership boundary

Every normal Merkava selector begins beneath `#gameShell`.

Do not add bare `body`, `html`, `button`, `input`, `*`, `.overlay`, `.hud`,
or other global selectors to Merkava styles.

The game may coexist with the shared player shell and future hosts.
Its CSS must never repaint siblings.

`#gameShell` is the local viewport root and an isolated stacking context.

## Manifest order

`styles/game.css` loads the cascade in deliberate layers:

1. `tokens.css`
2. `foundation.css`
3. feature styles such as HUD, modes, bosses and overlays
4. `interactions.css`
5. `responsive.css`
6. `motion.css`

Tokens establish law before feature rules.
Reduced-motion closes the cascade.

## Named stacking layers

`tokens.css` defines the only Merkava stacking authorities:

- canvas: 0
- labels: 20
- HUD: 30
- overlay: 40
- notice: 50
- fatal: 60

Feature styles use `var(--merkava-layer-...)`.
Do not introduce raw numeric z-index declarations.

## Interaction contract

Relevant buttons, links and form controls need deliberate states.

- Hover motion belongs inside `(hover: hover) and (pointer: fine)`.
- `:active` feedback remains universal for mouse, pen and touch.
- `:focus-visible` stays obvious and independent from hover.
- Mobile action controls keep a 44px minimum block size.
- Disabled controls remain visibly and semantically distinct.

## Motion contract

Motion is short and purposeful.
Transform, opacity, border, background and shadow communicate hierarchy or state.

Avoid infinite decorative motion except bounded ambient identity effects.

`motion.css` contains local `prefers-reduced-motion` handling under `#gameShell`.
Never add a page-global reduced-motion reset from this game.

## Overlay contract

Merkava overlays are absolute inside `#gameShell`, not global fixed layers.
Panels use safe-area-aware padding, bounded `dvh` sizing, internal scrolling,
and `overscroll-behavior: contain`.

Document overflow is not a valid substitute for panel scrolling.
A phone viewport must not acquire accidental horizontal spill.

## Automated enforcement

`test/cssScope.test.mjs` fails when selectors leak outside `#gameShell`,
z-index bypasses named tokens, the interaction contract disappears,
or manifest ordering changes incorrectly.

`test/support/CssSelectorBranches.mjs` understands functional selectors such as
`:is()` so this invariant remains strict without false positives.
