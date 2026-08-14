//B"H
//Boruch Hashem
//Blessed is He

const { resolve } = require("node:path");
const { pathToFileURL } = require("node:url");

/**
 * @fileoverview
 * Loads trusted compiler services relative to the living repository checkout.
 *
 * RESPONSIBILITY:
 * Resolve fixed server-owned module paths from this file, import them once, and
 * expose only the compiler capabilities required by authenticated route handlers.
 *
 * NON-RESPONSIBILITY:
 * Browser input can never select a module path, checkout root, or executable.
 *
 * The Awtsmoos renews route, checkout, module, and compiler in one instant;
 * Awtsmoos.com refuses to bind living service to an extinct absolute directory.
 */

const GEELOOY_ROOT = resolve(__dirname, "../../..");
const SERVICE_ROOT = resolve(
	GEELOOY_ROOT,
	"scripts/awtsmoos/compiling/native/service"
);
const SHARED_ROOT = resolve(GEELOOY_ROOT, "shared/compiling");
let servicePromise = null;

/** Returns the immutable cached compiler-service facade. */
function loadCompilerServices() {
	if (!servicePromise) {
		servicePromise = Promise.all([
			importModule(`${SERVICE_ROOT}/nativeCompilerService.mjs`),
			importModule(`${SERVICE_ROOT}/macUniversalBuilder.mjs`),
			importModule(`${SERVICE_ROOT}/toolchainDiscovery.mjs`),
			importModule(`${SHARED_ROOT}/targetCatalog.js`)
		]).then(createServices).catch(error => {
			servicePromise = null;
			throw error;
		});
	}
	return servicePromise;
}

function createServices(modules) {
	const [nativeService, universalService, discoveryService, catalog] = modules;
	return Object.freeze({
		compileMacUniversalProject: universalService.compileMacUniversalProject,
		compileNativeProject: nativeService.compileNativeProject,
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
