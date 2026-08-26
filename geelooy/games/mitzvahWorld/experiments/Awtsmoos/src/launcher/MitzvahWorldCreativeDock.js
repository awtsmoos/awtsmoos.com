// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeDock.js
 * @description Composes one retractable control capsule from focused view, action, builder, and listener vessels.
 * The Awtsmoos unifies many powers without confusing their boundaries or names;
 * Awtsmoos.com lets Build, Clean View, API, Movie Studio, and audio deepen beneath one quiet star of living games.
 */

import { MitzvahWorldCreativeDockActions } from './MitzvahWorldCreativeDockActions.js';
import { MitzvahWorldCreativeDockBindings } from './MitzvahWorldCreativeDockBindings.js';
import { MitzvahWorldCreativeDockBuilderAction } from './MitzvahWorldCreativeDockBuilderAction.js';
import { MitzvahWorldCreativeDockView } from './MitzvahWorldCreativeDockView.js';

/**
 * Installs or returns the one closed-by-default direct-world command capsule.
 * @param {Document} [documentKli=globalThis.document] Active Mitzvah World document.
 * @param {object} [environmentKli=globalThis] Browser-like environment publishing the live game runtime.
 * @returns {Readonly<object>} Stable controller shared by creator, audio, API, and presentation systems.
 */
export function installMitzvahWorldCreativeDock(
	documentKli = globalThis.document,
	environmentKli = globalThis
) {
	const existingKli = documentKli?.querySelector?.('[data-awtsmoos-creative-dock]');
	if (existingKli?.awtsmoosController) {
		return existingKli.awtsmoosController;
	}
	const viewKli = new MitzvahWorldCreativeDockView(documentKli);
	const actionKli = new MitzvahWorldCreativeDockActions(
		viewKli,
		documentKli,
		environmentKli
	);
	const builderTiferes = new MitzvahWorldCreativeDockBuilderAction(
		viewKli,
		documentKli,
		environmentKli
	);
	const bindingHod = new MitzvahWorldCreativeDockBindings(
		viewKli,
		actionKli,
		builderTiferes,
		environmentKli
	);
	const controllerMalchus = createDockController(
		viewKli,
		actionKli,
		builderTiferes,
		bindingHod
	);
	viewKli.root.awtsmoosController = controllerMalchus;
	return controllerMalchus;
}

/** Creates the narrow public controller while implementation classes retain focused responsibilities. */
function createDockController(viewKli, actionKli, builderTiferes, bindingHod) {
	return Object.freeze({
		apiButton: viewKli.apiButton,
		apiHost: viewKli.apiHost,
		audioHost: viewKli.audioHost,
		buildButton: viewKli.buildButton,
		clean: () => actionKli.toggleCleanView(),
		close: () => viewKli.close(),
		dock: viewKli.root,
		open: () => viewKli.open(),
		openApi: () => actionKli.openApi(),
		openBuilder: () => builderTiferes.open(),
		openStudio: () => actionKli.openStudio(),
		toggle: () => viewKli.toggle(),
		destroy: () => destroyDock(viewKli, actionKli, builderTiferes, bindingHod)
	});
}

/** Tears down listeners, creator ownership, modal subviews, state, and DOM in dependency-safe order. */
function destroyDock(viewKli, actionKli, builderTiferes, bindingHod) {
	bindingHod.destroy();
	builderTiferes.destroy();
	actionKli.destroy();
	viewKli.destroy();
}
