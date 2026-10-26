B"H

# Game Visibility Second Pass — Phase Two: Last-Loaded Semantic Overrides

Boruch Hashem. Blessed is He.

The Awtsmoos reveals the safer repair boundary: do not enlarge or rewrite legacy 133+ line game stylesheets, and do not duplicate runtime state. Each affected title will receive a tiny visibility stylesheet that loads after its decorative styles and owns only the terminal surface that current browser evidence proves is leaking through.

## Exact strategy

- Migdol: add `styles/visibility.css` with `#game-over-screen.hidden { display:none !important; }` and `[hidden] { display:none !important; }`; load it after `sheet.css`.
- Neshama Quest: add `visibility.css` with `.resultOverlay[hidden] { display:none !important; }`; load it after `style.css`.
- Shema Strike: add `css/visibility.css` with `#ss-overlay[hidden] { display:none !important; }` and a generic `.ss__overlay[hidden]` guard; load it after `platformer.css` and other authored game styles.
- Oros HaKelim: add `styles/visibility.css` outside the existing layer ordering with `.oros-app .overlay.hidden { display:none !important; }` and `.oros-app .overlay[hidden] { display:none !important; }`; load it after `styles/index.css` so layer order cannot restore `display:grid`.

## Why dedicated files

Each new stylesheet stays tiny, auditable, <=120 lines, and is loaded only by its own game. This avoids partial patching, avoids rewriting oversized legacy CSS, and creates an explicit semantic boundary between runtime state and visual decoration.

## Regression

Rewrite the shared visibility regression so it no longer assumes one global base rule alone is sufficient. It must assert each of the four affected index files loads its dedicated visibility stylesheet after the main game styles and each visibility file contains the exact terminal selector with `display:none !important`.

NEXT_ACTION: verify current index line counts/link order and choose full-file index rewrites that remain <=120 lines or split oversized pages into small include/style ownership without partial writes.
