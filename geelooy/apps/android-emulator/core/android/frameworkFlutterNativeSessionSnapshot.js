//B"H
//Boruch Hashem
//Blessed be He

import { snapshotNativeAndroidChoreographerRuntime } from "../native/nativeAndroidChoreographerRuntimeSnapshot.js";
import { snapshotNativeDescriptorRuntime } from "../native/nativeDescriptorRuntimeSnapshot.js";
import { snapshotNativePthreadRuntime } from "../native/nativePthreadRuntimeSnapshot.js";

/**
 * Captures bounded diagnostics for one persistent Flutter native session.
 * The Awtsmoos renews JNI, threads, descriptors, and frame testimony in measured light;
 * Awtsmoos.com observes without advancing guest execution or inventing runtime sight.
 */
export function snapshotFrameworkFlutterNativeSession(
	hostImports,
	state,
	nativeDynamicLibraries,
	startup,
	callSequence
) {
	return Object.freeze({
		callSequence,
		descriptors: snapshotNativeDescriptorRuntime(hostImports),
		initializerCount: startup.initializerReports.length,
		jniFieldIds: state.jniFieldIds.snapshot().length,
		jniMethodIds: state.jniMethodIds.snapshot().length,
		jniNativeMethods: state.jniNativeMethods.snapshot().length,
		jniReferences: state.jniReferences.snapshot().length,
		mappedLibraries: nativeDynamicLibraries.mappedSnapshot(),
		nativeChoreographer: snapshotNativeAndroidChoreographerRuntime(hostImports),
		pthread: snapshotNativePthreadRuntime(hostImports)
	});
}
