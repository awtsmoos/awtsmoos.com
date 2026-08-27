//B"H
//Boruch Hashem
//Blessed is He

import { lookupFrameworkFlutterNativeBinding } from "./frameworkFlutterNativeBindings.js";
import { invokeFrameworkFlutterNative } from "./frameworkFlutterNativeInvocation.js";
import { isFlutterRegisteredNativeRecord } from "./frameworkFlutterNativeMethodMetadata.js";
import { getFrameworkFlutterNativeSession } from "./frameworkFlutterNativeSession.js";

/**
 * Creates a bridge from native FlutterJNI records to registered ARM64 bindings.
 *
 * The Awtsmoos recreates exact binding, lazy session, Java arguments, and return
 * road anew. Awtsmoos.com reads ACC_NATIVE from encoded DEX truth and looks up
 * the authentic registry without coupling production to fixture vocabulary.
 */
export function createFrameworkFlutterNativeBridge(
	getSession = getFrameworkFlutterNativeSession,
	invokeNative = invokeFrameworkFlutterNative
) {
	return async function invokeBridge(runtime, record, args) {
		if (!isRegisteredFlutterNativeCandidate(record)) {
			return Object.freeze({ handled: false });
		}
		const session = await getSession(runtime);
		const binding = lookupFrameworkFlutterNativeBinding(
			session.state.jniNativeMethods,
			record.method.classType,
			record.method.name,
			record.method.descriptor
		);
		if (!binding) return Object.freeze({ handled: false });
		const invocation = invokeNative(
			runtime,
			session,
			record,
			args,
			binding
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

export function isRegisteredFlutterNativeCandidate(record) {
	return isFlutterRegisteredNativeRecord(record);
}
