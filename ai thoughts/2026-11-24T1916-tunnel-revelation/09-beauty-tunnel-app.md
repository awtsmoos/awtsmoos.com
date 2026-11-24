# B"H — Tunnel Revelation Run 09: BEAUTY (Tunnel app only) — 2026-11-25

Hai's demand: CSS insanely beautiful, vivid and extreme. Scope was ONLY
`geelooy/apps/tunnel` — tunnel-control untouched (another agent's run 07
is active there).

## What changed (visual)
One appended beauty layer (+281 lines) at the end of
`geelooy/apps/tunnel/css/tunnel.css`; no HTML/JS changes except the cache
pin. One gold family intensified to the extreme, zero clashing hues
(served CSS grep: 0 blue/violet hexes):

- **Grounds:** deep luminous espresso-black with three layered gold
  radial glows (dark); vivid champagne `#fff6d8 → #ffeeb8` with amber
  glows (light).
- **Hero:** 36px radius, gold border, layered radial luminosity, an
  animated sheen sweep + pulsing glow orb (transform/opacity only),
  and the H1 set in a full gold gradient (bright champagne→amber in
  dark; deep readable amber in light) with a soft gold drop-shadow.
- **Buttons:** primary = rich gold gradient (`#ffefa8 → #ffd54a →
  #f5a400`) with glow shadow and hover lift; secondary = gold glass;
  the active method-chooser button now takes the full gold gradient —
  the pressed method is unmistakable.
- **Onboarding steps:** each of the 7 steps is now a gold-glass card
  with a glowing gold-gradient number medallion (CSS counter), gold
  strong headings, gold-dashed detail note.
- **Panels/cards:** gold-tinted glass gradients, gold borders, deep
  layered shadows + hover glow; tabs take the gold gradient when
  active; command/status/code boxes are deep espresso with gold
  borders and champagne-gold mono text (in BOTH schemes — a jewel
  contrast that stays readable); topbar is warm dark glass with a
  gold-gradient brand mark and gold-gradient brand wordmark; status
  bar, pills, mission rows, scrollbar and text selection all gold.
- **Both schemes covered:** the full layer is re-expressed inside
  `prefers-color-scheme: light` (the run-04 gold bug came from the
  light block — verified explicitly this time, see below).
- **Motion law:** sheen/pulse are transform/opacity, hover lift is
  gated to `(hover:hover)`, and `prefers-reduced-motion` disables all
  animation/transition.

## Verification
- Served production: page pins `tunnel.css?v=0076b46303` (busted via
  `scripts/bustAllCaches.mjs --write --html geelooy/apps/tunnel/index.html`),
  CSS serves 200 and contains the BEAUTY RUN 09 layer. File mode 644.
- CDP emulation (server Chrome 9471, euifix client), screenshots in
  `/root/beauty09-shots/` (320/390/1280 × dark, 1280 × light):
  layout width == scroll width at **320, 390, 1280 in both schemes** —
  no page overflow; all 7 onboarding steps present at every width.
  The only element wider than the viewport in the raw scan is
  `.hero-glow`, clipped by the hero's `overflow:hidden` by design
  (pre-existing decorative orb; it contributes 0 scroll width).
  Computed styles prove the gradients live: dark H1
  `linear-gradient(98deg, rgb(255,248,220), rgb(255,213,74), …)`,
  light H1 deep-amber gradient, primary buttons gold gradient in both.
  Screenshots read personally: dark desktop, dark 390 and light
  desktop all vivid, elegant, readable, no clash, no raw elements.
- Tests: `indexHtml.test.cjs` PASS, `inlineLinkGold.test.cjs` PASS
  (gold-link law intact, no blue/violet hexes), onboarding chooser
  click test PASS in the type:module sandbox (in-repo plain-node ESM
  failure is the pre-existing harness quirk documented in runs 04/05 —
  same failure on unmodified code). Chooser active state is now the
  gold gradient, verified in the 390 screenshot (Native pressed).

## Files / rollback
- `geelooy/apps/tunnel/css/tunnel.css` (+281), `index.html` (pin only),
  this ledger file. All other-session dirty paths preserved.
- Rollback: `git revert <this commit>` restores pin `418d7099a0` design.
