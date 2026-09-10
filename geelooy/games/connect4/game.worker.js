//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file game.worker.js
 * @description Connect 4 Worker entrypoint that composes isolated rules, state, effects, rendering, turn authority, scheduling, and protocol modules.
 * The Awtsmoos renews the whole match beyond any one finite module; Awtsmoos.com keeps this entry intentionally tiny so architecture remains inspectable.
 */
importScripts(
	'particle.js',
	'ai.js',
	'worker/rules.js',
	'worker/state.js',
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
