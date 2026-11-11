# Star Collector — Generation Manifest

**The entire spec given to the generator (mechanics only):**
"Star Collector: pilot a ship, collect falling stars for points, meteors cost a life, 3 lives, it speeds up over time, game over and restart."

Nothing else was specified. Every other decision below was **inferred, not specified** — made by the generator the way the finished system should make them: from the mechanics, standard game conventions, and the Human Takeover code laws.

## Given (from the spec, verbatim mechanics)

- Name: Star Collector.
- The player pilots a ship.
- Falling stars are collected for points.
- Meteors cost a life.
- 3 lives.
- It speeds up over time.
- Game over, and restart.

## Standing default — the Universal Controls Law (user order, 2026-11-11)

Not an inference: a standing law for anything the system generates, any app or any game. Whatever is generated ships, **by default**, the full coordinated input stack through **one unified input layer** — never per-control hard-coding scattered across files:

- **Desktop keyboard** (arrows + WASD).
- **Mouse / pointer** control appropriate to the piece (here: hold-and-drag steering on the canvas).
- **Touch**: on-screen touch controls and/or drag on the play area — fully playable on a phone with no keyboard (here: **both** — a 4-direction touch pad *and* drag steering).
- **All sources feed the same input state** the game loop reads; menus/buttons are touch-operable too (restart included).
- **Pause**: on visibility loss (auto-pause), plus a pause control that works by touch *and* key (⏸ button / P / Escape), wired through the same layer.

Implementation here: `js/input/` is the unified layer — `keyboard.js`, `pointer.js`, `touchbuttons.js` are sources; `input.js` merges them into the single input object the loop reads, and owns pause. `css/controls.css` styles the pad + pause button (`touch-action: none` so drags never scroll the page). The ship steers toward the pointer target when one is held, else reads the merged direction flags.

## Inferred, not specified (generator decisions)

- **Platform/rendering:** browser game on a `<canvas>` (480×640), plain HTML/CSS/JS, no build step, no external assets; classic scripts (not ES modules) under a `window.SC` namespace so it runs from `file://`.
- **Controls:** the input *stack* is the standing law above; game-specific choices within it were inferred — ship moves vertically too, clamped to the field and to the lower half; pointer steering is hold-and-drag toward the pointer; the touch pad is a single row of ◀ ▲ ▼ ▶ hold buttons.
- **Scoring value:** +10 points per star (spec says "for points", no number given).
- **Speed-up shape:** discrete levels — level rises every 20s; star/meteor fall speeds, spawn rates, and ship speed scale per level (spec says "speeds up", no curve given).
- **HUD:** score, lives (hearts), elapsed timer (mm:ss), and current level displayed above the canvas (spec implies score/lives visibility; timer and level readouts are inferred presentation).
- **Collision feel:** circle hit-tests with a small shrink margin; after a meteor hit, 1.6s of invincibility (ship blinks) so one pass can't drain multiple lives.
- **Game over screen:** overlay with final score, survival time, and a Restart **button**; restart fully resets state (score, lives, timer, level, entities) and play resumes immediately.
- **Module decomposition (21 files, 7 folders + root):** entry/boot (`js/main.js`, `index.html`), core loop + state + levels (`js/core/`), the unified input layer (`js/input/` keyboard, pointer, touchbuttons, input), entities (`js/entities/` ship, star, meteor, spawner), renderer (`js/render/renderer.js`), UI (`js/ui/` hud, screens), styles split by concern (`css/` main, hud, screens, controls). Decomposition follows the Human Takeover laws: small whole files, one concern each, named top-level declarations so the semantic projectors can observe every file.
- **Test surface:** live game state exposed at `window.SC.state` (read-only by convention) so automated play tests can verify mechanics without scraping pixels.
- **Aesthetics:** dark starfield backdrop with slowly scrolling stars, drawn ship/star/meteor shapes (no image assets).

## Tree (21 files, 7 folders + root)

```
stress-game/
├─ manifest.md                  — this plan
├─ index.html                   — entry: canvas, HUD + pause button, touch pad, game-over overlay, script tags in dependency order
├─ css/
│  ├─ main.css                  — page layout, canvas frame, starfield backdrop
│  ├─ hud.css                   — score / lives / timer / level HUD bar
│  ├─ screens.css               — game-over overlay + restart button
│  └─ controls.css              — [law] touch pad + pause button styles, touch-action: none on canvas
└─ js/
   ├─ main.js                   — boot: builds state, wires the unified input (pause callbacks), starts loop
   ├─ core/
   │  ├─ state.js               — state factory + reset (score, lives, timer, level, entities, paused flag)
   │  ├─ levels.js              — level from elapsed time; speed/spawn tables per level
   │  └─ game.js                — the loop: update(dt), collisions, spawning, level-ups, game over (frozen while paused)
   ├─ input/                    — THE unified input layer (Universal Controls Law)
   │  ├─ keyboard.js            — source: arrow keys + WASD tracking, preventDefault on arrows
   │  ├─ pointer.js             — [law] source: hold-and-drag steering (mouse + touch via Pointer Events) → analog target
   │  ├─ touchbuttons.js        — [law] source: press-and-hold on-screen pad (data-dir buttons) → direction flags
   │  └─ input.js               — [law] the merger: one input state for the loop + pause (P/Esc, ⏸ button, visibility auto-pause)
   ├─ entities/
   │  ├─ ship.js                — ship: position, speed, steers to pointer target or direction flags, draw (triangle + flame)
   │  ├─ star.js                — star: fall, spin, draw (5-point star), collect radius
   │  ├─ meteor.js              — meteor: fall with sway, draw (rock), hit radius
   │  └─ spawner.js             — timed star/meteor spawning using level rates
   ├─ render/
   │  └─ renderer.js            — canvas draw: background stars, entities, ship (blink while invincible)
   └─ ui/
      ├─ hud.js                 — HUD DOM update: score, lives (hearts), timer mm:ss, level
      └─ screens.js             — game-over overlay show/hide, restart button wiring
```

## Verification tiers

1. `node --check` on every JS file.
2. Re-observation on the production server: Merkava parser + Human Takeover JS/CSS/HTML projectors over every file — 0 failures, nodes per file.
3. Merkava executor (`geelooy/api/merkava/dist/merkava.mjs`, `runPage`/`runPageWithJs`) executes the game page: JS status clean, zero JS errors over the run window.
4. Headless-Chrome play test over CDP: zero runtime exceptions, loop advances, keyboard moves the ship (read from `window.SC.state`), HUD present, score/lives readable — and, since the Controls Law run, **touch proof**: canvas drag steering via dispatched touch events, touch-pad hold movement, tap-to-pause/resume, visibility auto-pause, and game-over restart tapped by touch.

## Verification notes (Controls Law run, 2026-11-11)

- **Executor finding (real, game-side fix):** the Merkava executor exposes its own input objects to page code as globals (`keyboard`, `mouse`, `page`, `probe`) and its classic-script lowering rewrites line-initial `var name =` into globals writes — so a page local named `keyboard` (in `input.js`) silently replaced the executor's keyboard object and its state snapshot died with `this.keyboard.toJSON is not a function`. No game error was involved; renaming the local to `keySource` fixed it. Standing convention for generated code: **never name a local after an engine global** (keyboard, mouse, page, probe, document, location, history…).
- Play-test note: the meteor-life check is relative (lives before → after), because natural meteors can legitimately hit the ship during the earlier touch phases.
