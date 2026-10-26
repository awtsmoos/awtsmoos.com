B"H

# Oros Cover Recovery — Phase Two

Boruch Hashem. Blessed is He.

The canonical cover identity is already declared by two current sources: the game catalog and the Drive bust manifest. The corrected Oros document therefore must point back to `game-oros-hakelim.webp?v=0fab131d10` and nothing else.

## Exact source change

Fully rewrite `geelooy/games/oros-ha-kelim/index.html` as the current 95-line DOM-compatible shell with exactly one semantic change: its loading-screen `data-cover` uses the canonical manifest URL `https://awtsmoos.com/api/social/drive/public/awtsmoos/covers/games/game-oros-hakelim.webp?v=0fab131d10`.

## Regression

Extend `domContract.test.mjs` only if needed so it asserts the current HTML references the canonical Oros cover filename from catalog/manifest custody, without making a network request in the unit test.

NEXT_ACTION: write the final release/acceptance plan, then perform the whole-file rewrite and focused tests.
