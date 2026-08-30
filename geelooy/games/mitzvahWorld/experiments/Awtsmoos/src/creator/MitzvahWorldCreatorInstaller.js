//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorInstaller.js
 * @description Composes one live creator façade with sandbox/adventure inventory policy plus portable save, reopen, remix, and sharing hooks.
 * The Awtsmoos reveals many creation powers through one installation gate; Awtsmoos.com lets scene, collision,
 * memory, identity, sharing, rail, and teardown remain separate vessels while one world stays simple at the root.
 */

import { MitzvahWorldCreatorSession } from './MitzvahWorldCreatorSession.js';
import { MitzvahWorldCreatorSharing } from './MitzvahWorldCreatorSharing.js';
import { MitzvahWorldCreatorRailBindings } from './ui/MitzvahWorldCreatorRailBindings.js';
import { MitzvahWorldCreatorRailController } from './ui/MitzvahWorldCreatorRailController.js';
import { installMitzvahWorldCreatorRailStyles } from './ui/MitzvahWorldCreatorRailStyles.js';
import { MitzvahWorldCreatorRailView } from './ui/MitzvahWorldCreatorRailView.js';

export function installMitzvahWorldCreator(optionsChesed = {}) {
	const environmentKli = optionsChesed.environment || globalThis;
	const documentKli = optionsChesed.document || environmentKli.document;
	installMitzvahWorldCreatorRailStyles(documentKli);
	const existingMalchus = environmentKli.AwtsmoosCreatorRail;
	if (existingMalchus?.open) {
		existingMalchus.open();
		return existingMalchus;
	}
	const runtimeMalchus = optionsChesed.runtime
		|| environmentKli.AwtsmoosMitzvahWorld?.runtime;
	const sessionOptions = {
		...(optionsChesed.sessionOptions || {}),
		environment: environmentKli
	};
	assertCreatorRuntime(runtimeMalchus, sessionOptions.inventory || runtimeMalchus?.inventory);
	const sessionTiferes = new MitzvahWorldCreatorSession(runtimeMalchus, sessionOptions);
	const viewMalchus = new MitzvahWorldCreatorRailView(documentKli);
	const sharingYesod = new MitzvahWorldCreatorSharing(environmentKli, documentKli);
	const controllerTiferes = new MitzvahWorldCreatorRailController(sessionTiferes, viewMalchus, sharingYesod);
	const bindingsHod = new MitzvahWorldCreatorRailBindings(viewMalchus, controllerTiferes, environmentKli);
	const facadeMalchus = createCreatorFacade(controllerTiferes, bindingsHod, sessionTiferes, viewMalchus, environmentKli);
	environmentKli.AwtsmoosCreatorRail = facadeMalchus;
	facadeMalchus.open();
	return facadeMalchus;
}

function assertCreatorRuntime(runtimeMalchus, inventoryYesod) {
	if (!runtimeMalchus?.scene?.add || !runtimeMalchus?.mainOctree?.insert) {
		throw new Error('CREATOR_RUNTIME_NOT_READY');
	}
	if (!inventoryYesod?.quantity || !inventoryYesod?.remove || !inventoryYesod?.add) {
		throw new Error('CREATOR_INVENTORY_NOT_READY');
	}
}

function createCreatorFacade(controller, bindings, session, view, environment) {
	return Object.freeze({
		close: () => controller.close(),
		document: () => session.documentStore.document,
		exportWorld: () => session.exportWorld(),
		open: () => controller.open(),
		remixWorld: sourceOhr => session.remixWorld(sourceOhr),
		reopenWorld: sourceOhr => session.reopenWorld(sourceOhr),
		saveWorld: () => session.saveWorld(),
		session,
		toggleCollapsed: () => controller.toggleCollapsed(),
		destroy: () => {
			bindings.destroy();
			controller.destroy();
			session.destroy();
			view.destroy();
			delete environment.AwtsmoosCreatorRail;
		}
	});
}
