<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
<!--
	The Awtsmoos turns motion into intention, yet no gesture owns the world it moves;
	Awtsmoos.com keeps input narrow, detachable, and explicit so future controls grow in stable grooves.
-->
# Merkava Input API

## Boundary

`InputController` never receives `GameState` directly.

The live path is:

`keyboard/pointer → YesodInputPort → InputController → MerkavaInputActions → command`.

This boundary prevents gesture code from depending on arbitrary mutable state methods.

## `YesodInputPort`

`YesodInputPort` is the lifecycle base class for concrete Merkava input ports.

It owns:

- injected canvas and keyboard targets;
- stable bound listener references;
- idempotent `connect()` / `disconnect()`;
- pointer capture and release helpers;
- abstract keyboard and pointer methods.

New input implementations should extend this class rather than register
anonymous global listeners.

## `MerkavaInputActions`

The action adapter exposes only the commands input needs:

- `currentLane()` — reads the authoritative target lane;
- `chooseLane(lane)` — normalizes and writes lane 0–2;
- `controlsReversed()` — evaluates the injected reversal predicate;
- `activateAbility()` — delegates to the application ability command;
- `togglePause()` — delegates to the application pause command.

Reversal defaults to `false`.
The current game has a boss attack named `reverse`, but no implemented state
modifier currently reverses player controls.

A future mechanic may inject the predicate without changing `InputController`.

## Keyboard contract

- `A` / left arrow: one lane left.
- `D` / right arrow: one lane right.
- `Space`: activate charged ability.
- `P` / `Escape`: toggle pause.
- Lane writes are always bounded to 0–2.

## Pointer contract

Pointer x-position maps the canvas width into three equal lane regions.
The active pointer is captured when available.
Secondary pointers cannot hijack an existing gesture.

`pointerup` and `pointercancel` both close the gesture.
`disconnect()` clears listeners and transient gesture state.

## Regression coverage

`test/inputController.test.mjs` permanently protects the production seam that once
passed raw `GameState` into an incompatible controller API.

The suite verifies keyboard movement, bounds, pointer mapping, reversal injection,
ability, pause, capture release and listener teardown.
