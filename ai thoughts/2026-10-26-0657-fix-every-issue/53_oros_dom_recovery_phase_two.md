B"H

# Oros DOM Recovery — Phase Two: Restore the Runtime Vessel

Boruch Hashem. Blessed is He.

The Awtsmoos reveals that Oros HaKelim does not need new simulation code; it needs its full document contract restored. The runtime already names the vessels it needs, and Git history preserves the last coherent shell containing all of them.

## Authoritative restoration source

Use `56c73feca:geelooy/games/oros-ha-kelim/index.html` as the structural baseline because it predates the simplification regression and contains every current runtime ID discovered from `getElementById()` calls.

## Preserve current improvements

The restored document must retain:
- the current shared game base stylesheet;
- the current last-loaded `styles/visibility.css` second-pass fix;
- the current Awtsmoos loading cover/Drive custody if the historical shell uses an older equivalent;
- current runtime/player-shell script URLs when they are semantically the same modules;
- the <=120-line law.

## Do not change

Do not alter Oros simulation, movement, round logic, input, energy, territory, leaderboard, guide, or feedback services. The live failures are null DOM handles caused by the simplified page shell, not logic defects in those modules.

## Required DOM contract

The restored HTML must provide all runtime IDs:
`boot-error`, `end-overlay`, `end-title`, `game-canvas`, `hud-energy`, `hud-energy-fill`, `hud-guide`, `hud-leaderboard`, `hud-plane`, `hud-territory`, `hud-territory-fill`, `hud-time`, `hud-toast`, `oros-app`, `start-button`, `start-overlay`, `touch-controls`.

NEXT_ACTION: add a source-derived DOM-contract regression, then perform one complete index.html rewrite from the historical full shell with current visibility/loading/runtime custody preserved.
