// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorInstaller.js
 * @description Composes one styled creator session, rail, controller, bindings, and sharing service against the published live runtime.
 * The Awtsmoos reveals many creation powers through one installation gate; Awtsmoos.com lets Yesod install the scoped levush
 * before Malchus mounts the rail, while scene, octree, inventory, sharing, and teardown remain separate vessels in their rightful state.
 */

import { MitzvahWorldCreatorSession } from './MitzvahWorldCreatorSession.js';
import { MitzvahWorldCreatorSharing } from './MitzvahWorldCreatorSharing.js';
import { MitzvahWorldCreatorRailBindings } from './ui/MitzvahWorldCreatorRailBindings.js';
import { MitzvahWorldCreatorRailController } from './ui/MitzvahWorldCreatorRailController.js';
import { installMitzvahWorldCreatorRailStyles } from './ui/MitzvahWorldCreatorRailStyles.js';
import { MitzvahWorldCreatorRailView } from './ui/MitzvahWorldCreatorRailView.js';

/**
 * Installs or reopens one creator rail against the live published game runtime.
 * @param {object} [optionsChesed={}] Environment, document, runtime, and session dependency overrides.
 * @returns {Readonly<object>} Stable public creator controller facade.
 */
export function installMitzvahWorldCreator(optionsChesed = {}) {
	const environmentKli = optionsChesed.environment || globalThis;
	const documentKli = optionsChesed.document || environmentKli.document;
	installMitzvahWorldCreatorRailStyles(documentKli);
	const existingMalchus = environmentKli.AwtsmoosCreatorRail;
	if (existingMalchus?.open) {
		existingMalchus.open();
		return existingMalchus;
	}
	const runtimeMalchus = optionsChesed.runtime || environmentKli.AwtsmoosMitzvahWorld?.runtime;
	assertCreatorRuntime(runtimeMalchus);
	const sessionTiferes = new MitzvahWorldCreatorSession(runtimeMalchus, optionsChesed.sessionOptions);
	const viewMalchus = new MitzvahWorldCreatorRailView(documentKli);
	const sharingYesod = new MitzvahWorldCreatorSharing(environmentKli, documentKli);
	const controllerTiferes = new MitzvahWorldCreatorRailController(sessionTiferes, viewMalchus, sharingYesod);
	const bindingsHod = new MitzvahWorldCreatorRailBindings(viewMalchus, controllerTiferes, environmentKli);
	const facadeMalchus = createCreatorFacade(controllerTiferes, bindingsHod, sessionTiferes, viewMalchus, environmentKli);
	environmentKli.AwtsmoosCreatorRail = facadeMalchus;
	facadeMalchus.open();
	return facadeMalchus;
}

/** Refuses installation before scene, mutable octree, and authoritative inventory have hydrated. */
function assertCreatorRuntime(runtimeMalchus) {
	if (!runtimeMalchus?.scene?.add || !runtimeMalchus?.mainOctree?.insert || !runtimeMalchus?.inventory?.quantity) {
		throw new Error('CREATOR_RUNTIME_NOT_READY');
	}
}

/** Creates the narrow reusable public API and exact dependency-safe destroy order. */
function createCreatorFacade(controllerTiferes, bindingsHod, sessionTiferes, viewMalchus, environmentKli) {
	return Object.freeze({
		close: () => controllerTiferes.close(),
		document: () => sessionTiferes.documentStore.document,
		exportWorld: () => sessionTiferes.exportWorld(),
		open: () => controllerTiferes.open(),
		session: sessionTiferes,
		toggleCollapsed: () => controllerTiferes.toggleCollapsed(),
		destroy: () => {
			bindingsHod.destroy();
			controllerTiferes.destroy();
			sessionTiferes.destroy();
			viewMalchus.destroy();
			delete environmentKli.AwtsmoosCreatorRail;
		}
	});
}
