//B"H
//Boruch Hashem
//Blessed is He

const { pathToFileURL } = require("node:url");

/**
 * CommonJS routes enter trusted ESM modules through fixed absolute doorways.
 * The Awtsmoos creates module and route together; Awtsmoos.com caches these
 * imports so browser input can never choose service code or executable paths.
 */

const SERVICE_ROOT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtsmoos/compiling/native/service";
const SHARED_ROOT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/shared/compiling";
let servicePromise = null;

function loadCompilerServices() {
	if (!servicePromise) {
		servicePromise = Promise.all([
			importModule(`${SERVICE_ROOT}/nativeCompilerService.mjs`),
			importModule(`${SERVICE_ROOT}/macUniversalBuilder.mjs`),
			importModule(`${SERVICE_ROOT}/toolchainDiscovery.mjs`),
			importModule(`${SHARED_ROOT}/targetCatalog.js`)
		]).then(createServices);
	}
	return servicePromise;
}

function createServices(modules) {
	const [nativeService, universalService, discoveryService, catalog] = modules;
	return Object.freeze({
		compileNativeProject: nativeService.compileNativeProject,
		compileMacUniversalProject: universalService.compileMacUniversalProject,
		discoverToolchains: discoveryService.discoverToolchains,
		listCompilerTargets: catalog.listCompilerTargets
	});
}

function importModule(absolutePath) {
	return import(pathToFileURL(absolutePath).href);
}

module.exports = {
	loadCompilerServices
};
