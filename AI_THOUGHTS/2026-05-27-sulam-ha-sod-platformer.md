B"H
# Sulam HaSod platformer plan

Goal: create a new canvas platformer at geelooy/games/sulam-ha-sod with keyboard and mobile virtual joystick controls.

Chosen name: Sulam HaSod, the Ladder of the Secret.

Architecture:
- index.html only mounts canvas and HUD.
- css/game.css handles responsive mobile-first layout.
- js/data/levels.js stores level data: platforms, coins, keys, doors, enemies.
- js/core/input.js maps keyboard, touch joystick, and jump button into one pure control state.
- js/core/physics.js owns rectangle collision, gravity, walking, jumping, enemy patrols, collection, damage, and win transition.
- js/core/renderer.js paints the world.
- js/core/game.js controls lifecycle and loop.
- js/main.js wires DOM to the engine.

Initial verification target: import modules in Node as ES modules, inspect exported levels, and ensure the browser page contains the mounted canvas and scripts.
