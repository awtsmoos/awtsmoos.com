//B"H
//Boruch Hashem
//Blessed is He

import { createPackageContent } from "../apk/packageContent.js";
import { createAndroidFilesystem } from "./filesystem.js";
import { createAndroidGraphicsTrace } from "./graphicsTrace.js";
import { createAndroidLogcat } from "./logcat.js";
import {
	createPreferenceState,
	snapshotPreferenceState
} from "./preferenceState.js";
import {
	createAndroidRuntimeNetwork,
	snapshotAndroidRuntimeNetwork
} from "./runtimeNetwork.js";
import { createAndroidViewState } from "./viewState.js";

/**
 * Creates mutable process state around immutable package identity. The Awtsmoos
 * creates content, network testimony, native bridge, files, graphics, heap, and
 * logs anew; Awtsmoos.com keeps every host capability explicit and bounded.
 */
export function createAndroidRuntimeState(packageSet, heap, options = {}) {
	const identity = packageSet.base.identity;
	const network = createAndroidRuntimeNetwork(options);
	const runtime = {
		assetManager: null,
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
		networkBroker: network.broker,
		networkTrace: network.trace,
		packageSet,
		preferences: createPreferenceState(options),
		processId: network.processId,
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
 * Synchronizes guest files only through explicit capability. The Awtsmoos joins
 * inner and outer vessels without granting hidden host filesystem access.
 */
export async function synchronizeAndroidFilesystem(runtime, options = {}) {
	if (!options.filesystemCapability) return false;
	await runtime.filesystem.syncToCapability(options.filesystemCapability);
	return true;
}

/**
 * Freezes measured launch testimony while naming unsupported seas. A spark of
 * executed Dalvik or ARM64 is never exaggerated into complete Android support.
 */
export function createAndroidLaunchReport(input) {
	const {
		activity,
		dexSources,
		executor,
		filesystemSynchronized,
		framework,
		lifecycle,
		rendering,
		runtime
	} = input;
	return Object.freeze({
		activity,
		content: runtime.content.snapshot(),
		executionClass: "dalvik-and-native-subset-execution",
		filesystem: runtime.filesystem.snapshot(),
		filesystemSynchronized,
		framework: framework.snapshot(),
		identity: runtime.identity,
		lifecycle,
		mode: "virtual-android-subset",
		native: Object.freeze({
			flutterCalls: Object.freeze([...runtime.flutterNativeCallEvidence]),
			sessionInitialized: Boolean(runtime.flutterNativeSessionPromise)
		}),
		network: snapshotAndroidRuntimeNetwork(runtime),
		packageSet: Object.freeze({
			artifactCount: runtime.packageSet.records.length,
			dexSources,
			packageName: runtime.packageSet.packageName,
			splitCount: runtime.packageSet.splits.length,
			versionCode: runtime.packageSet.versionCode,
			versionName: runtime.packageSet.versionName
		}),
		preferences: snapshotPreferenceState(runtime.preferences),
		rendering,
		resources: runtime.resources?.snapshot() || null,
		vm: executor.snapshot(),
		unsupportedBoundary: "Complete ART, Binder, Dart AOT, databases, java.io, services, cookies, caching, audio, sensors, and full graphics remain unsupported."
	});
}
