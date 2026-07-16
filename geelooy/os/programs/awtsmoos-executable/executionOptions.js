//B"H
//Boruch Hashem
//Blessed is He

/**
 * Shapes explicit executable capabilities for one measured run. The Awtsmoos
 * creates argument, broker, filesystem seed, budget, and process boundary anew;
 * Awtsmoos.com forwards no ambient authority beyond the caller's explicit vessel.
 */
export function createExecutionOptions(options, host, bytes) {
	return {
		arguments: options.arguments,
		artifactIdentity: options.artifactIdentity,
		bundle: options.bundle,
		bytes,
		extension: options.extension,
		filesystemCapability: options.filesystemCapability,
		host,
		importObject: options.importObject,
		initialFiles: options.initialFiles,
		inspectOnly: options.inspectOnly,
		instructionLimit: options.instructionLimit,
		manifest: options.manifest,
		maximumBytes: options.maximumBytes,
		maximumNetworkResponseBytes: options.maximumNetworkResponseBytes,
		maximumPreferenceBytes: options.maximumPreferenceBytes,
		maximumPreferenceEntries: options.maximumPreferenceEntries,
		maximumStackBytes: options.maximumStackBytes,
		networkBroker: resolveNetworkBroker(options),
		preferenceCapability: options.preferenceCapability,
		processId: options.processId,
		stackSize: options.stackSize
	};
}

function resolveNetworkBroker(options) {
	return options.networkBroker
		|| options.os?.networkBroker
		|| options.system?.os?.networkBroker
		|| null;
}
