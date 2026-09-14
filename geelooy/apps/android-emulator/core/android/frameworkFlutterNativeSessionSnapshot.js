//B"H
//Boruch Hashem
//Blessed be He

import {
	snapshotNativeDescriptorRuntime
} from "../native/nativeDescriptorRuntimeSnapshot.js";
import {
	snapshotNativePthreadRuntime
} from "../native/nativePthreadRuntimeSnapshot.js";

/**
 * Captures bounded diagnostics for one persistent Flutter native session.
 *
 * The snapshot reads registries without advancing guest execution or consuming
 * descriptor readiness. It intentionally exposes platform-loop testimony beside
 * JNI and mapped-library counts so an authentic run can explain sleeping engines.
 *
 * @param {object} hostImports Native host-import registry owning runtime evidence.
 * @param {object} state Persistent Flutter JNI machine state.
 * @param {object} nativeDynamicLibraries Dynamic-library state for mapped testimony.
 * @param {object} startup JNI_OnLoad and initializer reports.
 * @param {number} callSequence Number of registered FlutterJNI calls attempted.
 * @returns {object} Frozen serializable diagnostic snapshot.
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
		pthread: snapshotNativePthreadRuntime(hostImports)
	});
}
