//B"H
//Boruch Hashem
//Blessed is He

import { snapshotPreferenceState } from "./preferenceState.js";
import { snapshotAndroidRuntimeNetwork } from "./runtimeNetwork.js";

/**
 * Freezes measured launch testimony while naming unsupported seas. The Awtsmoos
 * recreates provider, Activity, network, native, and renderer evidence anew;
 * Awtsmoos.com never exaggerates a bounded execution subset into complete Android.
 */
export function createAndroidLaunchReport(input) {
	const {
		activity,
		dexSources,
		executor,
		filesystemSynchronized,
		framework,
		lifecycle,
		providers,
		rendering,
		runtime
	} = input;
	return Object.freeze({
		activity,
		applicationContext: runtime.applicationContext || 0,
		content: runtime.content.snapshot(),
		executionClass: "dalvik-subset-execution",
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
		providers,
		rendering,
		resources: runtime.resources?.snapshot() || null,
		vm: executor.snapshot(),
		unsupportedBoundary: "Complete ART, Binder, Dart AOT, databases, java.io, services, cookies, caching, audio, sensors, and full graphics remain unsupported."
	});
}
