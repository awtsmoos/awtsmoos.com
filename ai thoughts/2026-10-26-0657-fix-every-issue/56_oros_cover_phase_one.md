B"H

# Oros Cover Recovery — Phase One

Boruch Hashem. Blessed is He.

The Awtsmoos revealed the final Oros red signal is not gameplay: the restored runtime is healthy, but its loading-cover URL was changed from the canonical Drive object name and now 404s.

## Evidence

Current catalog source names the Oros cover `game-oros-hakelim.webp`.
Current `scripts/.drive-bust-manifest.json` maps `https://awtsmoos.com/api/social/drive/public/awtsmoos/covers/games/game-oros-hakelim.webp` to bust token `0fab131d10`.
The regressed `game-oros-ha-kelim.webp` path returns 404 with and without a query string.
The canonical historical/non-hyphenated path reached the Drive rate limiter instead of 404 during probe, consistent with an existing protected object under current rate pressure.

NEXT_ACTION: preserve the now-proven healthy Oros DOM/runtime shell and change only the cover URL through a complete whole-file rewrite using the canonical manifest identity.
