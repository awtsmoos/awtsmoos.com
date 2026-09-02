//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file installNesherProTools.js
 * @description Installs one additive professional-tools doorway after unified Awtsmoos Studio mounts, without changing its canonical movie/session identity.
 * The Awtsmoos lets the unified Studio welcome deeper instruments while remaining one living creative home;
 * Awtsmoos.com exposes a stable public facade so humans, scripts, and future adapters can open the same pro domain.
 */
import { listNesherProTools } from './NesherProToolsCatalog.js';
import { NesherProToolsController } from './NesherProToolsController.js';
import { createNesherProToolsView } from './NesherProToolsView.js';

/**
 * Installs the lazy professional-tools surface once and publishes its additive public facade.
 * @returns {NesherProToolsController} Bound Pro Tools controller.
 */
export function installNesherProTools() {
	if (globalThis.AwtsmoosStudioProTools?.controller) {
		return globalThis.AwtsmoosStudioProTools.controller;
	}

	const view = createNesherProToolsView();
	const controller = new NesherProToolsController(view).bind();
	const facade = Object.freeze({
		controller,
		list() {
			return listNesherProTools().map((tool) => ({ ...tool }));
		},
		open(toolId) {
			controller.open(toolId);
		},
		close() {
			controller.close();
		},
		openStandalone(toolId = 'stage') {
			controller.openStandalone(toolId);
		}
	});

	globalThis.AwtsmoosStudioProTools = facade;
	return controller;
}
