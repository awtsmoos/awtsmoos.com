// B"H

/**
 * B"H — The stored config remains canonical; derived runtime coordinates are
 * added once so connection, logging, cleanup, and memory never invent shapes.
 */
function normalizeRuntimeConfig(config = {}, dependencies = {}) {
	const wsUrl = String(config.wsUrl || config.relay || '').trim();
	const localApiPort = Number(config.localApiPort || config.localApi?.port || 0) || null;
	const deviceStateRoot = dependencies.DeviceStateRoot?.root
		? dependencies.DeviceStateRoot.root(config)
		: config.deviceStateRoot || null;
	const inlineLimitBytes = typeof dependencies.inlineLimit === 'function'
		? dependencies.inlineLimit()
		: Number(dependencies.inlineLimit || 0) || null;
	return {
		...config,
		wsUrl,
		deviceStateRoot,
		localApiPort,
		inlineLimitBytes
	};
}

function createConfigLoader(configModule, dependencies = {}) {
	return function loadRuntimeConfig() {
		return normalizeRuntimeConfig(configModule.loadConfig(), dependencies);
	};
}

module.exports = { createConfigLoader, normalizeRuntimeConfig };
