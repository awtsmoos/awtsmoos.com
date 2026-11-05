// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file COURSE_SCHEMA.md
 * @description Frozen schema for Mitzvah World obstacle-course definitions.
 */

/**
# Mitzvah World Course Schema — v1 (FROZEN)

Course definitions are plain JSON objects validated by `courseSchema.js`.
Schema version: `mitzvah-world.course/1`. Do not change field meanings without
bumping the version and updating the validator.

## Units
Meters, seconds, radians. Y is up. Player capsule: radius 0.35, height 1.6.
Physics envelope: walk 4.2 m/s, run 7.2 m/s, jump v=9.2 (height ~2.0m),
double-jump v=8.1, gravity 21, step-up limit 0.55m.

## Top-level fields

| field        | type   | required | meaning |
|--------------|--------|----------|---------|
| schema       | string | yes      | Must equal `mitzvah-world.course/1`. |
| id           | string | yes      | URL-safe id, used in `?course=<id>` and best-time storage keys. |
| name         | string | yes      | Display name. |
| difficulty   | string | yes      | One of `easy`, `medium`, `hard`. |
| description  | string | yes      | One-line player-facing description. |
| parSeconds   | number | yes      | Par time in seconds (> 0). |
| spawn        | object | yes      | `{x, y, z, facing}` — y is FEET height; facing in radians (0 = +Z). |
| killY        | number | yes      | Feet below this height → instant respawn at last checkpoint. |
| region       | object | yes      | `{minX, maxX, minZ, maxZ}` — course physics only applies inside. |
| checkpoints  | array  | yes      | Ordered `[{x, z, y, radius}]` — y is feet height at the checkpoint. |
| finish       | object | yes      | `{x, z, y, radius}` — valid only after ALL checkpoints are hit in order. |
| platforms    | array  | yes      | Static boxes `[{x, z, top, w, d, surface, thickness?, visualOnly?}]` — x/z center, top = walkable surface height, thickness (default 1) extends downward. `visualOnly: true` renders the box with no physics (water, decoration). |
| movers       | array  | yes      | Moving boxes (see below). |
| hazards      | array  | yes      | Rotating sweepers (see below). |
| coins        | array  | yes      | `[{x, y, z}]` pickups, radius 1.3m. |

## Surfaces
`grass` (grip 1.0), `stone` (0.95), `wood` (0.85), `ice` (accel 0.35, decel 0.12 — slides).

## Movers
`{id, kind, w, d, thickness?, surface, period, phase?}` plus kind fields:

- `kind: 'sinusoid'` — `{axis: 'x'|'y'|'z', base: {x, z, top}, amplitude}`.
  Position = base + amplitude * sin(2π (t / period) + phase) along axis.
  Vertical amplitude must keep per-frame travel ≤ 0.4m at 60fps for carry stability.
- `kind: 'path'` — `{path: [[x, z, top], ...2+], loop: true}`.
  Constant-speed travel along the polyline loop; period = full loop seconds.

Movers carry standing players (platform delta is added to the player before the
movement frame) and use substepped swept push-out so a fast mover can never
tunnel through the player — it pushes instead.

## Hazards (sweepers)
`{kind: 'sweeper', center: {x, y, z}, armLength, armWidth, armHeight, period, phase?}`.
The arm rotates about Y at `center`; y is the arm's vertical CENTER. A hit
(respawn at last checkpoint + 1.2s invulnerability) occurs when the player's
torso band overlaps the arm's height band AND the player's XZ capsule touches
the arm segment.

## Run rules
- Timer runs on real frame delta while the run is active (started, not finished).
- Checkpoints must be touched in order; respawn always returns to the highest
  checkpoint reached (or spawn). Respawn is synchronous (well under 250ms).
- Best times persist in localStorage under `mitzvahWorld.courseBest.<id>`.
- Course state is per-player: in multiplayer every client simulates its own run;
  the multiplayer bridge keeps replicating positions, so other avatars stay visible.
*/
export const COURSE_SCHEMA_DOCUMENTED_VERSION = 'mitzvah-world.course/1';
