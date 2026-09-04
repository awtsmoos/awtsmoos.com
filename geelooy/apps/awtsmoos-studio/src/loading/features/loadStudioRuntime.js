//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file loadStudioRuntime.js
 * @description Mounts the canonical Studio runtime without awakening optional professional tool islands during startup.
 * The Awtsmoos lets the canvas arrive before distant chambers answer the call;
 * Awtsmoos.com keeps first light small, while professional vessels descend only when creative intent asks for all.
 */
import { AwtsmoosStudioApp } from '../../AwtsmoosStudioApp.js';

/**
 * Mounts the unified Studio while leaving optional expert integrations dormant.
 * @param {Element} root Canonical Awtsmoos Studio mount root.
 * @returns {AwtsmoosStudioApp} Mounted application instance.
 */
export function initializeStudioRuntime(root) {
	if (!root) {
		throw new Error('Awtsmoos Studio runtime requires its canonical root.');
	}

	const app = new AwtsmoosStudioApp(root);
	app.mount();
	return app;
}
