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
import { createAndroidViewState } from "./viewState.js";

/**
 * Creates mutable process state around immutable package identity. The Awtsmoos
 * creates content, resources, hierarchy, network, static fields, files, graphics,
 * heap, and logs anew; Awtsmoos.com keeps every host capability explicit.
 */
export function createAndroidRuntimeState(packageSet, heap, options = {}) {
	const identity = packageSet.base.identity;
	const runtime = {
		assetManager: null,
		content: createPackageContent(packageSet, options),
		contentView: null,
		filesystem: createAndroidFilesystem(packageSet.packageName, options),
		graphics: createAndroidGraphicsTrace(options),
		heap,
		identity,
		logcat: createAndroidLogcat(options),
		maximumNetworkResponseBytes: networkLimit(options.maximumNetworkResponseBytes),
		networkBroker: options.networkBroker || null,
		packageSet,
		preferences: createPreferenceState(options),
		processId: processIdentifier(options.processId),
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
 * executed Dalvik is never exaggerated into complete Android compatibility.
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
		executionClass: "dalvik-subset-execution",
		filesystem: runtime.filesystem.snapshot(),
		filesystemSynchronized,
		framework: framework.snapshot(),
		identity: runtime.identity,
		lifecycle,
		mode: "virtual-android-subset",
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
		unsupportedBoundary: "Complete ART, Binder, native ARM64/Dart AOT execution, complete databases and java.io, services, cookies, caching, audio, sensors, and full graphics remain unsupported."
	});
}

function networkLimit(value) {
	const limit = Number(value ?? 8 * 1024 * 1024);
	if (!Number.isInteger(limit) || limit < 0) {
		const error = new Error(`ANDROID_NETWORK_LIMIT_INVALID:${value}`);
		error.code = "ANDROID_NETWORK_LIMIT_INVALID";
		throw error;
	}
	return limit;
}

function processIdentifier(value) {
	const identifier = String(value ?? "").trim();
	return identifier || null;
}
