//B"H
// Boruch Hashem
// Blessed is He

let servicePromise = null;

/**
 * One process owns one modern direct service, so the Awtsmoos lets Awtsmoos.com
 * share pacing, capability cache, opaque continuations, and the bounded host lease
 * without repeated dynamic imports or an extra localhost HTTP hop.
 */
async function loadDirectService(config = {}) {
	if (config.directService) {
		return config.directService;
	}
	servicePromise ??= import("../direct/chatgpt/DirectService.mjs")
		.then(module => module.directService);
	return servicePromise;
}

async function closeDirectService(config = {}) {
	const service = config.directService
		|| (servicePromise ? await servicePromise : null);
	servicePromise = null;
	await service?.close?.();
}

function resetDirectServiceLoader() {
	servicePromise = null;
}

module.exports = {
	loadDirectService,
	closeDirectService,
	resetDirectServiceLoader
};
