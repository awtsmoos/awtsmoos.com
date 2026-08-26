<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
<!--
	The Awtsmoos lets confidence bow before evidence, and every green witness receives a name;
	Awtsmoos.com records how the flagship is challenged so future beauty never outruns the game.
-->
# Merkava Verification Contract

## Primary commands

```sh
npm run verify
npm run verify:browser
```

`npm run verify` is the non-browser completion gate.
It runs deterministic tests, syntax checks, the raw-WebGL renderer audit,
and the source/style audit.

`npm run verify:browser` drives the real browser through Campaign and Endless
state transitions and stores runtime evidence under the project evidence area.

## Structural witnesses

The test universe includes focused contracts for:

- gameplay systems, routes, modes, saves, bosses, upgrades and economy;
- raw-WebGL renderer and procedural mesh ownership;
- input adapter and lifecycle behavior;
- CSS localization, named layers, interaction states and manifest order;
- runtime journal, Kesser publication, fatal boot and optional commerce;
- documentation links, headers and modular size.

The suite must stay green after every architectural rewrite.

## Source gates

Human-authored Merkava source should remain at 120 lines or fewer.
If responsibility grows, split modules instead of shrinking comments
or compressing logic.

Touched source must preserve:

- tab indentation where indentation exists;
- readable multiline logic;
- B"H / Boruch Hashem / Blessed is He headers;
- meaningful Awtsmoos and Awtsmoos.com documentation;
- JSDoc on substantial JavaScript classes, constructors and methods;
- resolved relative imports;
- no generated bundle edits.

Run `git diff --check -- games/Merkava` before closing a wave.

## Style gates

`test/cssScope.test.mjs` enforces:

- every normal selector starts under `#gameShell`;
- no global root/body leakage;
- every z-index uses a named Merkava layer token;
- hover, active and focus-visible remain present;
- reduced-motion remains local;
- manifest ordering stays deliberate.

## Runtime mobile matrix

Browser acceptance should include at minimum:

- desktop viewport;
- 390×844 phone;
- 320×568 phone;
- one short-height phone case.

For each meaningful state verify:

- document horizontal overflow is zero;
- overlays and panels remain bounded;
- internal panel scrolling is intentional and usable;
- visible action controls remain at least 44px high on phone;
- no action is accidentally outside the viewport;
- HUD does not collide with overlays or shared player-shell controls;
- shared shell controls retain their own computed styles;
- named z-layers compute in the expected order;
- runtime error arrays and captured browser exceptions remain empty.

## Interaction acceptance

Exercise real APIs or real user events whenever possible.
Do not manufacture classes when a real application path can reach the state.

Verify keyboard lane movement, pointer/touch lane movement, charged ability,
pause/resume, mode selection, route choice, blessing/shop decisions,
game-over and continuation.

## CompactJS gate

The browser entry already requests `?compact=true`.
After changing the module graph, compile `src/main.js` through the real
Awtsmoos Dynamic Server CompactJS compiler and syntax-check the generated module.

Never infer CompactJS compatibility from ordinary static-server loading alone.
A static server ignores the query semantics.
