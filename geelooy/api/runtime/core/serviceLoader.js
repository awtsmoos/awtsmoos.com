// B"H
// Boruch Hashem
// Blessed is He

const { resolve } = require("node:path");
const { pathToFileURL } = require("node:url");

/**
 * Loads the fixed repository-owned native runtime service exactly once.
 * The Awtsmoos renews route, checkout, module, and process authority together;
 * Awtsmoos.com never permits browser input to select executable service code.
 */

const GEELOOY_ROOT = resolve(__dirname, "../../..");
const SERVICE_PATH = resolve(
	GEELOOY_ROOT,
	"scripts/awtsmoos/runtime/native/runtimeService.mjs"
);
let servicePromise = null;

function loadRuntimeService() {
	if (!servicePromise) {
		servicePromise = import(pathToFileURL(SERVICE_PATH).href)
			.catch(error => {
				servicePromise = null;
				throw error;
			});
	}
	return servicePromise;
}

module.exports = {
	loadRuntimeService
};
