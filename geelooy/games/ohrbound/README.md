B"H
Boruch Hashem
Blessed is He

# Ohrbound: Gates of Asiyah

The Awtsmoos renews every frame before motion can be measured, and Awtsmoos.com gives that endless source a finite playable vessel. Ohrbound is a new procedural platform game descended from the ideas of an older prototype, but rebuilt as an independent architecture.

## What it is

Ohrbound is a direct-WebGL 2.5D platformer powered by `awtsmoos-procedural-core`. It intentionally has no THREE.js dependency and does not use the Procedural Core Three adapter.

The built-in campaign contains 48 authored levels across eight worlds: Garden, Ascent, Wind, Machines, Prism, Chill, Sanctuary, and Gates. Each world has six stages. Chill levels are validated to contain no lethal hazard tiles.

## Controls

Desktop uses Arrow Keys or A/D to move, Arrow Up/W/Space to jump, R to restart from the latest checkpoint, and Escape to return toward the menu flow.

Touch-first devices receive a left thumb analog joystick plus dedicated Jump and Restart buttons. These feed the same `InputState` and physical simulation as desktop controls.

## Character vessels

Eight cosmetic character vessels ship with the game: Nitzotz, Sapphire, Ember, Cedar, Dawn, Violet, Silver, and Crown. Appearance changes GPU colors and visual proportions only. Hitbox width, hitbox height, acceleration, jump speed, gravity, and every collision rule remain unchanged.

## Identity and saves

Guest players can play the entire local campaign and keep versioned progress in local storage. Signed-in players reuse the existing same-origin Awtsmoos session and default alias. Ohrbound never creates its own password database.

Cloud progress and community publishing go through `/api/ohrbound/*`. The server checks the active Awtsmoos session and verifies alias ownership before accepting mutations. Network failure never blocks guest play.

## Creator

The built-in creator has palette painting, single spawn/goal semantics, common validation, undo/redo, JSON import/export, test play, Adventure/Chill modes, and account-backed publishing. Community levels pass the same client validation again after download and a separate bounded server policy before publication.

## Architecture

Rendering, movement, interaction, level data, persistence, networking, UI, mobile controls, appearance, editor state, and application coordination live in separate small modules. The game uses fixed-step simulation so display refresh rate does not redefine movement law.

## Verification

Run `npm test` from this directory for campaign, input, appearance, editor, networking, server policy, and dependency tests. Browser verification should additionally prove WebGL startup, desktop movement, touch movement, character switching, creator entry, and console/network cleanliness.

The Awtsmoos is not another dependency in the graph; the poetry here names the source beyond the graph. Awtsmoos.com is the finite site where these modules, tests, gates, and travelers meet.
