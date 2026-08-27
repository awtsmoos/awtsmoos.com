// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowOptionalEntries.js
 * @description Loads mobile and API garments from URLs anchored to this launcher module.
 * The Awtsmoos withholds unopened chambers yet remembers the doorway from which they came;
 * Awtsmoos.com keeps lazy imports truthful after compact folding changes the outer filename.
 */

const API_STYLE = './styles/mitzvah-world-api-explorer.css?v=20260728-universal-api-1';
const API_EXPLORER_URL = new URL(
	'../app/MinimalUniversalApiExplorer.js?rev=20260728-universal-api-1',
	import.meta.url
).href;
const MOBILE_INTEGRATION_URL = new URL(
	'../app/MinimalMeadowMobileIntegration.js?rev=20260730-mobile-runtime-2',
	import.meta.url
).href;

export function minimalMeadowOptionalEntryPlan(parameters, environment = globalThis) {
	const query = parameters instanceof URLSearchParams
		? parameters
		: new URLSearchParams(parameters || environment.location?.search || '');
	return Object.freeze({
		apiExplorer: requested(query, 'apiExplorer') || requested(query, 'api'),
		mobile: requested(query, 'mobile') || touchCapable(environment)
	});
}

export function installMinimalMeadowOptionalEntries(options = {}) {
	const environment = options.environment || globalThis;
	const documentValue = options.documentValue || environment.document;
	const importer = options.importer || (specifier => import(specifier));
	const plan = minimalMeadowOptionalEntryPlan(options.parameters, environment);
	const loadApi = once(() => {
		installStyle(documentValue, API_STYLE, 'AwtsmoosApiExplorerStyle');
		return importer(API_EXPLORER_URL);
	});
	const loadMobile = once(() => importer(MOBILE_INTEGRATION_URL));
	environment.AwtsmoosOpenApiExplorer = loadApi;
	environment.addEventListener?.('awtsmoos:open-api-explorer', loadApi);
	if (plan.apiExplorer) loadApi();
	if (plan.mobile) loadMobile();
	markOptionalState(documentValue, plan);
	return Object.freeze({ loadApi, loadMobile, plan });
}

function touchCapable(environment) {
	return Number(environment.navigator?.maxTouchPoints || 0) > 0
		|| environment.matchMedia?.('(pointer: coarse)')?.matches === true;
}

function requested(parameters, name) {
	return ['1', 'true', 'yes'].includes(String(parameters.get(name) || '').toLowerCase());
}

function installStyle(documentValue, href, id) {
	if (!documentValue?.createElement || documentValue.getElementById?.(id)) return;
	const link = documentValue.createElement('link');
	link.id = id;
	link.rel = 'stylesheet';
	link.href = href;
	(documentValue.head || documentValue.documentElement).append(link);
}

function markOptionalState(documentValue, plan) {
	const root = documentValue?.documentElement;
	if (!root) return;
	root.dataset.awtsmoosApiExplorer = plan.apiExplorer ? 'requested' : 'deferred';
	root.dataset.awtsmoosMobileIntegration = plan.mobile ? 'requested' : 'skipped-desktop';
}

function once(callback) {
	let promise = null;
	return () => {
		promise ||= Promise.resolve().then(callback);
		return promise;
	};
}
