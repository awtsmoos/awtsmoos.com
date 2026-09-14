//B"H
//Boruch Hashem
//Blessed be He

import { lookupFrameworkFlutterNativeBinding } from "./frameworkFlutterNativeBindings.js";
import { invokeFrameworkFlutterNative } from "./frameworkFlutterNativeInvocation.js";
import { retainFrameworkFlutterNativeJavaContext } from "./frameworkFlutterNativeJavaContext.js";
import { isFlutterRegisteredNativeRecord } from "./frameworkFlutterNativeMethodMetadata.js";
import { runFrameworkFlutterNativeRootExecution } from "./frameworkFlutterNativeRootExecution.js";
import { getFrameworkFlutterNativeSession } from "./frameworkFlutterNativeSession.js";

/**
 * Creates a bridge from registered FlutterJNI records to authentic guest ARM64.
 *
 * The bridge resolves one persistent native session and binding, then holds the
 * platform-thread execution lease across the entire awaited JNI call. Browser event
 * turns therefore cannot run an ALooper callback concurrently on that same guest TLS
 * identity or stack while native-to-Java re-entry is still logically in progress.
 *
 * @param {Function} getSession Persistent Flutter native session resolver.
 * @param {Function} invokeNative Registered ARM64 invocation capability.
 * @returns {Function} Async FlutterJNI native bridge.
 */
export function createFrameworkFlutterNativeBridge(
	getSession = getFrameworkFlutterNativeSession,
	invokeNative = invokeFrameworkFlutterNative
) {
	return async function invokeBridge(runtime, record, args, javaContext) {
		if (!isRegisteredFlutterNativeCandidate(record)) {
			return Object.freeze({ handled: false });
		}
		if (javaContext) retainFrameworkFlutterNativeJavaContext(runtime, javaContext);
		const session = await getSession(runtime);
		const binding = lookupFrameworkFlutterNativeBinding(
			session.state.jniNativeMethods,
			record.method.classType,
			record.method.name,
			record.method.descriptor
		);
		if (!binding) {
			return Object.freeze({ handled: false });
		}
		const invocation = await runFrameworkFlutterNativeRootExecution(
			session,
			() => invokeNative(
				runtime,
				session,
				record,
				args,
				binding,
				javaContext
			)
		);
		return Object.freeze({
			evidence: invocation.evidence,
			handled: true,
			value: invocation.value
		});
	};
}

export const invokeFrameworkFlutterNativeBridge =
	createFrameworkFlutterNativeBridge();

/** Returns whether one DEX record is an authentically registered Flutter native. */
export function isRegisteredFlutterNativeCandidate(record) {
	return isFlutterRegisteredNativeRecord(record);
}
