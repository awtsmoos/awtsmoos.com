B"H

# Game Visibility Second Pass — Phase One: Live Cascade Truth

Boruch Hashem. Blessed is He.

The Awtsmoos revealed that the first shared games-only hidden rule was necessary but insufficient. Production serves the repaired shared stylesheet byte-for-byte, yet four game-specific display declarations still keep terminal surfaces visible.

## Proven live states after the first repair

- MIG-1: `#game-over-screen` carries class `hidden` yet computes `display:flex` and remains full-screen.
- NES-1: `#resultOverlay` has `hidden=true` yet computes `display:grid` and remains visible.
- SHS-1: `#ss-overlay` has `hidden=true` yet computes `display:flex` after Resume.
- ORO-1: `#end-overlay` carries `overlay hidden` yet computes `display:grid` before play and after Enter Asiyah.

## Exact source roots

- Migdol `styles/base.css` defines generic `.hidden { display:none }`, while later `styles/sheet.css` defines `#game-over-screen { display:flex }`.
- Neshama `style.css` is 133 lines and defines `.resultOverlay { display:grid }`; runtime already sets `resultOverlay.hidden=true`.
- Shema `platformer.css` is a large legacy file and defines `.ss__overlay { display:flex }`; runtime already sets `ss-overlay.hidden=true`.
- Oros `styles/game.css` places hidden rules inside `@layer oros.shell`, while `styles/overlays.css` later defines `.overlay { display:grid }` inside `@layer oros.overlay`; overlay layer therefore wins normal display precedence.

## Repair law

Do not rewrite simulation/state logic. Each runtime is already expressing the correct hidden state. Repair presentation ownership at the narrowest CSS point that can guarantee semantic hidden state after each game's own display rule.

NEXT_ACTION: choose <=120-line per-game visibility vessels that preserve legacy large CSS files, define focused static regressions for exact winning selectors, and verify index link order before source writes.
