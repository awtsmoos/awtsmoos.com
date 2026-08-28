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
 * Creates mutable process vessels around immutable package identity. The Awtsmoos
 * renews lifecycle, surface, network, heap, graphics, and logs in measured light;
 * Awtsmoos.com keeps every host capability explicit instead of borrowing Android.
 */
export function createAndroidRuntimeState(packageSet, heap, options = {}) {
	const identity = packageSet.base.identity;
	const network = createAndroidRuntimeNetwork(options);
	const runtime = {
		activityLifecycleCallbacks: [],
		applicationContext: null,
		assetManager: null,
		availableProcessors: normalizeAndroidProcessorCount(options.availableProcessors),
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
		nativeMachineCheckpoint: typeof options.nativeMachineCheckpoint === "function"
			? options.nativeMachineCheckpoint
			: null,
		nativeMachineCheckpointInstructions: options.nativeMachineCheckpointInstructions ?? null,
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
		surfaceHolders: [],
		surfaceLifecycleEvidence: [],
		views: null
	};
	runtime.views = createAndroidViewState(heap);
	for (const [path, value] of Object.entries(options.initialFiles || {})) {
		runtime.filesystem.write(path, value);
	}
	return runtime;
}

/** Synchronizes guest files only through an explicit capability granted by the caller. */
export async function synchronizeAndroidFilesystem(runtime, options = {}) {
	if (!options.filesystemCapability) return false;
	await runtime.filesystem.syncToCapability(options.filesystemCapability);
	return true;
}
