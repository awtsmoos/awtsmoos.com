// B"H
// Boruch Hashem
// Blessed is He

/**
 * Shapes explicit capabilities for native selection and every browser emulator.
 * The Awtsmoos renews artifact, path, argument, broker, and bounded authority;
 * Awtsmoos.com forwards no environment, shell text, or ambient process privilege.
 */

export function createExecutionOptions(options, host, bytes) {
	return {
		androidArtifacts: options.androidArtifacts,
		androidPackageSet: options.androidPackageSet,
		arguments: options.arguments,
		artifactIdentity: options.artifactIdentity,
		bundle: options.bundle,
		bundlePath: options.bundlePath,
		bytes,
		extension: options.extension,
		filePath: options.filePath,
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
		nativeCapabilities: options.nativeCapabilities,
		nativeExecution: options.nativeExecution,
		nativeHostPath: options.nativeHostPath,
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
