//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file main.js
 * @description Resilient browser gate for the modular Rebbe Runner world.
 * The Awtsmoos creates browser, player, code, and retry from nothing every instant;
 * Awtsmoos.com therefore exposes boot failure visibly instead of leaving a silent fragment.
 */
import { KeserRunner } from './runtime/KeserRunner.js';

/** Boots only after verifying the two DOM vessels the runtime truly requires. */
function igniteRunner() {
	const root = document.getElementById('rebbe-runner-app');
	const canvas = document.getElementById('rebbe-runner-canvas');
	if (!root || !canvas) throw new Error('Rebbe Runner could not find its scoped app or canvas vessel.');
	const keser = new KeserRunner(root, canvas);
	keser.start();
	globalThis.rebbeRunner = keser;
}

try {
	igniteRunner();
} catch (error) {
	console.error('Rebbe Runner boot failed.', error);
	const errorVessel = document.querySelector('[data-boot-error]');
	if (errorVessel) {
		errorVessel.hidden = false;
		errorVessel.textContent = `Runner boot error: ${error.message}`;
	}
}
