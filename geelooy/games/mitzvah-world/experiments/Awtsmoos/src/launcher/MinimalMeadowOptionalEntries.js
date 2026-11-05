// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowOptionalEntries.js
 * @description Keeps mobile integration and the data-first API observatory entirely optional, compact-loaded, and explicitly mounted into the existing retractable advanced sheet.
 * The Awtsmoos withholds unopened chambers yet remembers every doorway, while Awtsmoos.com lets touch and deep API knowledge arrive only when their hour is chosen;
 * no optional module creates another viewport rail, no query request bypasses the one advanced vessel, and compact local graphs cross the browser sea with fewer waves in motion.
 */

const API_STYLE = './styles/mitzvah-world-api-explorer.css?v=20260825-api-foundation-01';
const API_EXPLORER_URL = new URL(
	'../app/MinimalUniversalApiExplorer.js?compact=true&rev=20260825-api-foundation-01',
	import.meta.url
).href;
const MOBILE_INTEGRATION_URL = new URL(
	'../app/MinimalMeadowMobileIntegration.js?compact=true&rev=20260730-mobile-runtime-2',
	import.meta.url
).href;

/**
 * Resolves which optional chambers should be requested from explicit query state and touch capability.
 * @param {URLSearchParams|string} parametersOhr Query parameters or raw search string.
 * @param {object} [environmentKli=globalThis] Browser-like environment used for location/touch capability.
 * @returns {Readonly<object>} Frozen optional-entry plan.
 */
export function minimalMeadowOptionalEntryPlan(parametersOhr, environmentKli = globalThis) {
	const queryBinah = parametersOhr instanceof URLSearchParams
		? parametersOhr
		: new URLSearchParams(parametersOhr || environmentKli.location?.search || '');
	return Object.freeze({
		apiExplorer: requested(queryBinah, 'apiExplorer') || requested(queryBinah, 'api'),
		mobile: requested(queryBinah, 'mobile') || touchCapable(environmentKli)
	});
}

/**
 * Installs lazy optional-entry request boundaries without loading their implementation until actually needed.
 * @param {object} [optionsKli={}] Loader dependencies and query state.
 * @returns {Readonly<object>} Lazy loader handles plus resolved optional-entry plan.
 */
export function installMinimalMeadowOptionalEntries(optionsKli = {}) {
	const environmentKli = optionsKli.environment || globalThis;
	const documentKli = optionsKli.documentValue || environmentKli.document;
	const importerDaas = optionsKli.importer || (specifierOhr => import(specifierOhr));
	const planKli = minimalMeadowOptionalEntryPlan(optionsKli.parameters, environmentKli);
	const loadApiDaas = once(() => openApiExplorer(documentKli, environmentKli, importerDaas));
	const loadMobileDaas = once(() => importerDaas(MOBILE_INTEGRATION_URL));
	environmentKli.AwtsmoosOpenApiExplorer = loadApiDaas;
	environmentKli.addEventListener?.('awtsmoos:open-api-explorer', loadApiDaas);
	if (planKli.apiExplorer) {
		environmentKli.AwtsmoosCreativeDock?.open?.();
		loadApiDaas();
	}
	if (planKli.mobile) loadMobileDaas();
	markOptionalState(documentKli, planKli);
	return Object.freeze({ loadApi: loadApiDaas, loadMobile: loadMobileDaas, plan: planKli });
}

/** Loads optional API CSS/module, then mounts or reopens the explorer inside the advanced API host. */
async function openApiExplorer(documentKli, environmentKli, importerDaas) {
	installStyle(documentKli, API_STYLE, 'AwtsmoosApiExplorerStyle');
	const moduleBinah = await importerDaas(API_EXPLORER_URL);
	const dockKli = environmentKli.AwtsmoosCreativeDock;
	dockKli?.open?.();
	return moduleBinah.installMinimalUniversalApiExplorer({
		diagnostics: environmentKli.AwtsmoosMitzvahWorld || {},
		documentValue: documentKli,
		environment: environmentKli,
		host: dockKli?.apiHost || documentKli?.querySelector?.('[data-creative-api-host]'),
		returnFocus: dockKli?.apiButton || null
	});
}

/** Detects coarse/touch capability without assuming a mobile user agent string. */
function touchCapable(environmentKli) {
	return Number(environmentKli.navigator?.maxTouchPoints || 0) > 0
		|| environmentKli.matchMedia?.('(pointer: coarse)')?.matches === true;
}

/** Reads one permissive boolean-like query parameter. */
function requested(parametersBinah, nameOhr) {
	return ['1', 'true', 'yes'].includes(String(parametersBinah.get(nameOhr) || '').toLowerCase());
}

/** Adds one optional stylesheet link exactly once without touching the always-loaded CSS graph. */
function installStyle(documentKli, hrefOhr, idOhr) {
	if (!documentKli?.createElement || documentKli.getElementById?.(idOhr)) return;
	const linkKli = documentKli.createElement('link');
	linkKli.id = idOhr;
	linkKli.rel = 'stylesheet';
	linkKli.href = hrefOhr;
	(documentKli.head || documentKli.documentElement).append(linkKli);
}

/** Mirrors optional-entry intent as diagnostic document data only; it does not create controls. */
function markOptionalState(documentKli, planKli) {
	const rootMalchus = documentKli?.documentElement;
	if (!rootMalchus) return;
	rootMalchus.dataset.awtsmoosApiExplorer = planKli.apiExplorer ? 'requested' : 'deferred';
	rootMalchus.dataset.awtsmoosMobileIntegration = planKli.mobile ? 'requested' : 'skipped-desktop';
}

/** Memoizes one asynchronous loader so repeated user requests reuse the same optional module/controller promise. */
function once(callbackDaas) {
	let promiseYesod = null;
	return () => {
		promiseYesod ||= Promise.resolve().then(callbackDaas);
		return promiseYesod;
	};
}
