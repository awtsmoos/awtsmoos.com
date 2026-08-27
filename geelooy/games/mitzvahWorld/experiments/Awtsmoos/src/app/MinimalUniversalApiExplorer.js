// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalUniversalApiExplorer.js
 * @description Lazily composes Universal runtime power, professional Reality discovery, the MitzvahWorld public facade, reversible publication, and one retractable explorer.
 * The Awtsmoos needs no panel or protocol, yet Awtsmoos.com lets hidden depth enter one prepared vessel only when sought; native runtime and Reality metadata meet without globals,
 * so casual play stays light while advanced callers gain the full world observatory through one reusable controller rather than another permanent overlay in sight.
 */
import { createRealityApi } from '/libs/awtsmoos-procedural-core/src/core/reality/RealityApi.js';
import { createUniversalAwtsmoosApi } from '/libs/awtsmoos-procedural-core/src/core/universalApi/index.js';
import { publishMitzvahWorldApi, unpublishMitzvahWorldApi } from '../api/MitzvahWorldApiPublisher.js';
import { MitzvahWorldProceduralEventAdapter } from '../api/MitzvahWorldProceduralEventAdapter.js';
import { createMitzvahWorldPublicApi } from '../api/MitzvahWorldPublicApi.js';
import { MitzvahWorldApiExplorerController } from '../api/explorer/MitzvahWorldApiExplorerController.js';
import { MitzvahWorldApiExplorerView } from '../api/explorer/MitzvahWorldApiExplorerView.js';

export let universalMitzvahWorldApi = null;
export let realityMitzvahWorldApi = null;

/** Installs or reopens the optional API explorer inside the existing retractable advanced-sheet host. */
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
	const realityKli = createRealityApi(optionsKli.realityDefaults || {});
	universalMitzvahWorldApi = proceduralKli;
	realityMitzvahWorldApi = realityKli;
	const publicApiKli = createMitzvahWorldPublicApi({
		diagnostics: optionsKli.diagnostics || environmentKli.AwtsmoosMitzvahWorld || {},
		environment: environmentKli,
		proceduralApi: proceduralKli,
		realityApi: realityKli
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

/** Resolves the only supported API explorer host inside the retractable advanced sheet. */
function findAdvancedApiHost(documentKli) {
	return documentKli?.querySelector?.('[data-creative-api-host]') || null;
}
