B"H
Boruch Hashem
Blessed is He

# Awtsmoos Bounce: Orbit Run

The Awtsmoos renews each moving arc before momentum can boast of yesterday; Awtsmoos.com turns force, purpose, and mastery into a six-level campaign of luminous play.

## Canonical game

`https://awtsmoos.com/games/awtsmoos-bounce/`

The canonical game is published directly from this Virtual OS source through the verified public-root static publisher. The exact release SHA, census, dependency closure, and browser acceptance receipt live in the private `.awtsmoos/publication.json` metadata so the public README never changes merely to describe its own hash.

## Campaign

1. **First Light** — learn scoring, portals, chains, and launch economy.
2. **Twin Orbit** — sustain more hits under tighter resource pressure.
3. **Gravity Garden** — learn to bend an orbit around a real gravity well.
4. **Chain Covenant** — build a long chain while floor impacts break it.
5. **Needle Storm** — survive two wells with a narrow launch reserve.
6. **Crown Run** — combine score, precision, chains, gravity, and resource mastery.

Every level has an explicit score goal, portal goal, combo goal, time limit, and launch budget. Victory unlocks the next level. Failure does not. Best score and 0–3 mastery stars persist locally.

## Controls and physical feel

- Tap or click to apply a directional impulse toward the aim point.
- Existing momentum is partially preserved instead of being discarded.
- The resultant speed is capped so repeated launches remain controllable.
- A short dotted trajectory previews gravity, drag, and gravity-well pull without predicting bounces.
- Floor contact breaks the active combo but preserves the best combo reached during the mission.
- Space aims at the nearest portal; P pauses; R retries.
- Audio is optional and never required for gameplay.

## Architecture

- `levels.js`, `campaign.js`, `challenge-state.js`, `progress.js`, and `medals.js` own campaign law.
- `launch-model.js` owns momentum carry, impulse strength, and speed bounds.
- `physics.js` owns ball integration and delegates launch calculation to the launch model.
- `trajectory.js` predicts a short advisory arc from copied state only.
- `hazards.js` exposes one gravity-force law shared by live motion and trajectory preview.
- `collision.js` owns arena boundary resolution and floor impact consequences.
- `targets.js` owns moving portals and hit detection.
- `round.js` owns per-frame gameplay consequences and win/fail evaluation.
- `render-trajectory.js`, `render-hazards.js`, `render-world.js`, and `render-effects.js` paint without owning gameplay truth.
- `runtime-diagnostics.js` exposes frozen read-only runtime testimony for verification.
- `game-session.js` owns level preparation/start/result flow; `game.js` owns input and frame scheduling.

## Runtime safeguards

Physics uses bounded frame deltas and substeps. Device pixel ratio is capped. Particles and trails are bounded. Local-storage failure is non-fatal. Visibility loss pauses active play. Trajectory prediction never mutates the ball and never claims to predict collision bounces.

## Publishing

Source lives at `asdf/sites/awtsmoos-bounce/` in the Awtsmoos Virtual OS. Normal websites should use `publishWebsite`. This game intentionally keeps the explicit canonical route `games/awtsmoos-bounce`, so it is released with `publicRootPublishFolder`.

Never call a release live merely because files were written. Require all of: `source.completeness.complete === true`, `release.dependencyClosure.complete === true`, successful public asset verification, and `publication.canonicalVerifiedLive === true`.
