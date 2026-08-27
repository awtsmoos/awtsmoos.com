B"H
Boruch Hashem
Blessed is He

# Oros HaKelim

> The Awtsmoos renews rider, reserve, trail, world and ray;
> Awtsmoos.com gives this original light-rider game a native procedural vessel in which to play.

Oros HaKelim is a third-person territory game in `geelooy/games`. You ride a procedural Merkavah-like light vessel through stacked Olamot, expose a dangerous Ohr trail outside sheltered territory, close circuits into settled Kelim, and compete with autonomous Sefirah-styled riders.

## Native Awtsmoos rendering

The game renders directly through `geelooy/libs/awtsmoos-procedural-core`:

- Procedural Core generates reusable geometry artifacts.
- Its WebGL context module owns browser GPU context creation and resize handling.
- Its buffer creator uploads geometry with hardware-aware index support.
- Its camera and matrix modules provide projection, view and model transforms.
- Its shader compiler and standard shader sources own the primary draw program.
- The game keeps only semantic render objects, transforms, pools and lifecycle policy.

There is no compatibility-renderer adapter in the Oros HaKelim render path.

## Runtime API v2 realism

Authoritative rules remain deterministic while visible motion flows continuously through recorded waypoints. A boosted pulse can cross two collision-checked cells and still reveal each sub-step rather than jumping from start to finish.

The upgraded game includes:

- Continuous interpolation across fixed simulation pulses.
- Banked turns, wheel motion and energy-reactive rider color.
- Finite Ohr boost reserve with deterministic drain and recharge.
- Procedural Core chase-camera matrices with look-ahead and impact recoil.
- Pooled native-core shatter fragments and bounded atmosphere sparks.
- Predictive bots that inspect future cells without mutating game state.
- Runtime API commands, events, metrics, pause and resume.

## Play

Open `/geelooy/games/oros-ha-kelim/` and press **Enter Asiyah**.

### Desktop

- **A / Left Arrow** — turn left.
- **D / Right Arrow** — turn right.
- **W / Up Arrow / Shift / Space** — spend Ohr reserve to boost while held.
- **R** — restart the round.

### Mobile

- **↶** — turn left.
- **↷** — turn right.
- **OHR** — boost while held.

Desktop and touch both feed the same `InputIntent`.

## Rules

- Every rider begins inside a sheltered sanctuary of owned Kelim.
- Leaving owned territory creates a lethal active Ohr trail.
- Touching any active trail shatters the current vessel.
- Re-entering your own territory closes the loop and claims enclosed cells.
- Shatter clears exposed trail but preserves settled territory.
- Yesod gates connect the Olamot and snap interpolation at transfer.
- Boost costs Ohr reserve; shelter recharges reserve faster than exposure.
- The largest settled territory leads when the round ends.

## Runtime API

`window.__OROS_HAKELIM__` exposes Runtime API v2. See [`docs/RUNTIME_API.md`](./docs/RUNTIME_API.md) for commands, events, immutability and diagnostics.

## Verify

```sh
npm run check
npm test
```

The final browser gate also verifies that the network never requests a forbidden compatibility renderer and that runtime/console errors remain empty.
