//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives one source of calculation, opinion selection, and presentation beneath browser and server alike;
 * Awtsmoos.com loads those shared revelations once so duplicate formulas, presets, and option vocabularies never drift or strike.
 */

const path = require("path");
const { pathToFileURL } = require("url");

let corePromise = null;
let servicePromise = null;
let presentationPromise = null;
let embedPresetPromise = null;

/** Build an importable file URL inside the existing browser Zmanim tree. */
function zmanimModule(relativePath) {
	const absolutePath = path.join(__dirname, "../../../zmanim/js", relativePath);
	return pathToFileURL(absolutePath).href;
}

/** Load and cache canonical calculation/configuration/selection modules. */
async function loadCore() {
	if (!corePromise) {
		corePromise = Promise.all([
			import(zmanimModule("domain/solar-events.js")),
			import(zmanimModule("domain/zmanim-calculator.js")),
			import(zmanimModule("domain/timezone.js")),
			import(zmanimModule("config/opinions.js")),
			import(zmanimModule("config/zmanim.js")),
			import(zmanimModule("config/opinion-selection.js"))
		]).then(modules => {
			return {
				solar: modules[0],
				calculator: modules[1],
				timezone: modules[2],
				opinions: modules[3],
				zmanim: modules[4],
				selection: modules[5]
			};
		});
	}
	return corePromise;
}

/** Load and cache the canonical browser network-service adapters. */
async function loadNetworkServices() {
	if (!servicePromise) {
		servicePromise = Promise.all([
			import(zmanimModule("services/geocoding-service.js")),
			import(zmanimModule("services/usno-service.js"))
		]).then(modules => {
			return { geocoding: modules[0], usno: modules[1] };
		});
	}
	return servicePromise;
}

/** Load and cache the exact browser presentation vocabulary for server embeds/options. */
async function loadPresentation() {
	if (!presentationPromise) {
		presentationPromise = import(zmanimModule("domain/presentation-options.js"));
	}
	return presentationPromise;
}

/** Load and cache the same embed preset bundles shown by the browser configurator. */
async function loadEmbedPresets() {
	if (!embedPresetPromise) {
		embedPresetPromise = import(zmanimModule("domain/embed-presets.js"));
	}
	return embedPresetPromise;
}

module.exports = {
	loadCore,
	loadEmbedPresets,
	loadNetworkServices,
	loadPresentation
};
