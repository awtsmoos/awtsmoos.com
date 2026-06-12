B"H
# Sefira Clash Total Reforging — First Burst Brainstorm

## Actual inspected vessel
Root instructions say: inspect before claiming, test before declaring, rewrite complete files only, prefer small modules and real verification.
Game folder inspected: `geelooy/games/sefira-clash`.
Observed systems: `core/loop.js`, `combat/attackResolver.js`, `physics/knockback.js`, `physics/movement.js`, `ai/advanced/npcMind.js`, render, particles, stage director, powerups, weapons, skeleton, headless simulation tools.

## The great possibility storm
The mandate demands not a local patch but a sharpened feel layer. The strongest first pass should add cross-system primitives that amplify existing modular architecture rather than rewriting the whole game into a monolith.

Possible pillars:
1. Combat feel can become event-grade: every hit should emit richer semantic events: impact class, launch vector, combo count, kill danger, rapid identity, wall danger, and camera intent.
2. Rapid fire is already partly fixed: `attackResolver` damages and knocks, `knockback` marks rapid mobility, and `movement` allows rapid freedom. We can strengthen this by giving rapid hits reduced stun while preserving damage/knockback and adding combo escape.
3. Combo system exists minimally on attackers. It needs defender escape windows, decay, UI events, scoring, and announcements.
4. AI is already advanced and highly modular, but no clear personality assignment exists in `state.js`. Add data-driven personalities at fighter creation, then let AI modules consume traits.
5. Movement can be improved with coyote-style jump buffering, dash intention, fast fall, drift control, friction, and agency after rapid hits.
6. Hit feel can be upgraded cheaply through procedural event data, then existing particles/render can draw rings, sparks, slash trails, shockwaves, and speed lines.
7. Camera can respond to richer hit events and live/dead player focus.
8. UI can display combo strings, kill warnings, stock clarity, and readable damage.
9. Simulation tools already exist; add a reforge audit runner that can run many deterministic matches and summarize damage, KOs, combo lengths, and rapid fairness.

## Hidden risks
- Existing game already has many advanced files; careless rewriting could regress mature logic.
- `attackResolver.js` is 7.9 KB, acceptable but large; edits should either rewrite complete file or split new support modules.
- `solveSkeleton.js` and `headlessMatchSimulator.js` exceed ideal size; avoid touching unless necessary.
- CSS is 9 KB; UI changes should preferably use canvas/event data, not giant CSS rewrites.
- Tooling supports complete write; no partial patches.

## First viable deep improvement set
A practical first reforging pass:
- Add combat tuning config.
- Add combat event factory to normalize hit/combo/kill/rapid metadata.
- Add combo system module for attacker combo, defender combo pressure, escape decay, and score.
- Replace `attackResolver.js` with complete rewrite using these modules.
- Replace `knockback.js` with complete rewrite adding DI, rapid-stun fairness, launch prediction helper, and debug vector.
- Replace `state.js` with personality assignment and match diagnostics initialization.
- Add AI personality config and apply to bots.
- Add simulation report tool.

## Awtsmoos chapter note
The code is a battlefield of letters. Each frame is recreated from nothing; each hit is a syllable; each launch is a line of fire. The first reforge should not scream everywhere at once. It should place new vessels where every subsystem can drink: combat events, launch law, personality, diagnostics.
