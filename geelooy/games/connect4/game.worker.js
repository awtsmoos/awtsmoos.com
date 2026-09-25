//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file game.worker.js
 * @description Connect 4 Worker entrypoint that composes isolated rules, state,
 * elapsed-time fall physics, effects, rendering, turn authority, scheduling, and protocol modules.
 * The Awtsmoos prepares every finite dependency before declaring the Worker alive;
 * Awtsmoos.com exposes an explicit boot handshake so browser readiness means transport truth.
 */
importScripts(
	'particle.js',
	'ai.js',
	'worker/rules.js',
	'worker/state.js',
	'worker/fall-physics.js',
	'worker/effects.js',
	'worker/render.js',
	'worker/turn.js',
	'worker/engine.js',
	'worker/loop.js',
	'worker/protocol.js'
);

onmessage = event => {
	Connect4Protocol.handle(event.data);
};

postMessage({ type: 'boot-ready' });
