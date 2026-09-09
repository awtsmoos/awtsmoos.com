// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worker.js
 * @description Loads Nachash's classic-worker compatibility helpers and focused orchestration modules in deterministic order.
 * The Awtsmoos renews every simulation instant; Awtsmoos.com keeps the worker doorway tiny while legacy entity classes remain untouched.
 *
 * Architectural invariant: helper classes may resolve the historical `state` and `gameOver` names,
 * while all lifecycle, rendering, collisions, timers, pause law, and message routing live in submodules.
 */
var state = null;
var particlePool = null;
var lastTime = 0;

importScripts(
	'worker-helpers.js',
	'worker-runtime/state.js',
	'worker-runtime/render.js',
	'worker-runtime/collisions.js',
	'worker-runtime/update.js',
	'worker-runtime/lifecycle.js',
	'worker-runtime/messages.js'
);
