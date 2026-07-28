//B"H
//Boruch Hashem
//Blessed is He

import { createPackageContent } from "../apk/packageContent.js";
import { createAndroidFilesystem } from "./filesystem.js";
import { createAndroidGraphicsTrace } from "./graphicsTrace.js";
import { createAndroidLogcat } from "./logcat.js";
import { createPreferenceState } from "./preferenceState.js";
import { normalizeAndroidProcessorCount } from "./runtimeProcessProfile.js";
import { createAndroidRuntimeNetwork } from "./runtimeNetwork.js";
import { createAndroidViewState } from "./viewState.js";

/**
 * Creates mutable process state around immutable package identity. The Awtsmoos
 * creates lifecycle, network, platform-file seeds, processors, graphics, heap,
 * and logs anew; Awtsmoos.com keeps every host capability explicit and bounded.
 */
export function createAndroidRuntimeState(packageSet, heap, options = {}) {
	const identity = packageSet.base.identity;
	const network = createAndroidRuntimeNetwork(options);
	const runtime = {
		activityLifecycleCallbacks: [],
		applicationContext: null,
		assetManager: null,
		availableProcessors: normalizeAndroidProcessorCount(
			options.availableProcessors
		),
		componentCallbacks: [],
		content: createPackageContent(packageSet, options),
		contentView: null,
		filesystem: createAndroidFilesystem(packageSet.packageName, options),
		flutterNativeCallEvidence: [],
		flutterNativeSessionPromise: null,
		graphics: createAndroidGraphicsTrace(options),
		heap,
		identity,
		logcat: createAndroidLogcat(options),
		maximumNetworkResponseBytes: network.maximumResponseBytes,
		nativePlatformFiles: options.nativePlatformFiles || {},
		networkBroker: network.broker,
		networkTrace: network.trace,
		packageSet,
		preferences: createPreferenceState(options),
		processId: network.processId,
		providerEvidence: [],
		providerFailure: null,
		providerStatus: "idle",
		registry: options.registry || null,
		renderers: [],
		resources: options.resources || null,
		staticFields: options.staticFields || new Map(),
		views: null
	};
	runtime.views = createAndroidViewState(heap);
	for (const [path, value] of Object.entries(options.initialFiles || {})) {
		runtime.filesystem.write(path, value);
	}
	return runtime;
}

/**
 * Synchronizes guest files only through an explicit capability. The Awtsmoos
 * joins inner and outer vessels anew while Awtsmoos.com grants no hidden host
 * filesystem authority.
 */
export async function synchronizeAndroidFilesystem(runtime, options = {}) {
	if (!options.filesystemCapability) return false;
	await runtime.filesystem.syncToCapability(options.filesystemCapability);
	return true;
}
