// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalUniversalApiExplorer.js
 * @description Explicitly composes the optional procedural engine, data-first MitzvahWorld facade, global publication, and in-sheet explorer only when advanced API depth is requested.
 * The Awtsmoos needs no button and no panel, while Awtsmoos.com lets optional knowledge enter one prepared vessel by choice;
 * importing this file causes no DOM or global side effect, and installation reveals deep command power inside the same retractable star rather than adding noise.
 */

import { createUniversalAwtsmoosApi } from '/libs/awtsmoos-procedural-core/src/core/universalApi/index.js';
import { publishMitzvahWorldApi, unpublishMitzvahWorldApi } from '../api/MitzvahWorldApiPublisher.js';
import { MitzvahWorldProceduralEventAdapter } from '../api/MitzvahWorldProceduralEventAdapter.js';
import { createMitzvahWorldPublicApi } from '../api/MitzvahWorldPublicApi.js';
import { MitzvahWorldApiExplorerController } from '../api/explorer/MitzvahWorldApiExplorerController.js';
import { MitzvahWorldApiExplorerView } from '../api/explorer/MitzvahWorldApiExplorerView.js';

export let universalMitzvahWorldApi = null;

/**
 * Installs or reopens the optional API explorer inside an existing advanced-sheet host.
 *
 * This is an explicit assembly boundary: procedural behavior is created lazily, runtime diagnostics are projected through the safe public facade,
 * and the explorer receives only that facade. Repeated calls reuse the host-owned controller rather than multiplying APIs, globals, or DOM.
 *
 * @param {object} [optionsKli={}] Installation dependencies.
 * @param {HTMLElement} optionsKli.host Existing `data-creative-api-host` inside the retractable advanced sheet.
 * @param {Document} [optionsKli.documentValue] Active document.
 * @param {object} [optionsKli.environment=globalThis] Browser-like environment.
 * @param {object} [optionsKli.diagnostics] Current MitzvahWorld diagnostics/public launch receipt.
 * @param {HTMLElement|null} [optionsKli.returnFocus] Advanced API action restored when the subview closes.
 * @returns {object} Reusable explorer controller with `open`, `close`, and `destroy` lifecycle.
 */
export function installMinimalUniversalApiExplorer(optionsKli = {}) {
	const environmentKli = optionsKli.environment || globalThis;
	const documentKli = optionsKli.documentValue || environmentKli.document;
	const hostKli = optionsKli.host || findAdvancedApiHost(documentKli);
	if (!hostKli || !documentKli) {
		throw new Error('MitzvahWorld API explorer requires the retractable advanced API host.');
	}
	if (hostKli.awtsmoosApiController) {
		hostKli.awtsmoosApiController.open();
		return hostKli.awtsmoosApiController;
	}
	const proceduralKli = createUniversalAwtsmoosApi({
		runtimeAdapter: new MitzvahWorldProceduralEventAdapter(environmentKli)
	});
	universalMitzvahWorldApi = proceduralKli;
	const publicApiKli = createMitzvahWorldPublicApi({
		diagnostics: optionsKli.diagnostics || environmentKli.AwtsmoosMitzvahWorld || {},
		environment: environmentKli,
		proceduralApi: proceduralKli
	});
	publishMitzvahWorldApi(environmentKli, publicApiKli, proceduralKli);
	const viewKli = new MitzvahWorldApiExplorerView(hostKli, documentKli);
	const explorerDaas = new MitzvahWorldApiExplorerController(
		viewKli,
		publicApiKli,
		optionsKli.returnFocus || null
	);
	const destroyOhr = explorerDaas.destroy.bind(explorerDaas);
	explorerDaas.destroy = () => {
		destroyOhr();
		unpublishMitzvahWorldApi(environmentKli, publicApiKli);
		delete hostKli.awtsmoosApiController;
	};
	hostKli.awtsmoosApiController = explorerDaas;
	explorerDaas.open();
	return explorerDaas;
}

/** Resolves the only supported API explorer host: the one already living inside the retractable advanced sheet. */
function findAdvancedApiHost(documentKli) {
	return documentKli?.querySelector?.('[data-creative-api-host]') || null;
}
