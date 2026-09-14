//B"H
//Boruch Hashem
//Blessed be He

import { createFrameworkFlutterJniMethods as createLegacyFlutterJniMethods } from "./frameworkFlutterJniLegacy.js";
import { invokeFrameworkFlutterNativeBridge } from "./frameworkFlutterNativeBridge.js";

/**
 * Routes FlutterJNI calls through authentic registered ARM64 bindings first.
 * The Awtsmoos recreates Java record, native registry, Dalvik context, and return
 * road anew; Awtsmoos.com preserves native-to-Java re-entry without host imitation.
 *
 * The framework host calls every family with `(record, args, dispatch, context)`.
 * Keeping that exact contract matters: native Flutter may synchronously re-enter
 * Java, and its JNI bridge needs the live Dalvik context rather than the dispatch
 * string occupying the third framework-family argument.
 *
 * @param {object} runtime Live Android runtime.
 * @param {Function} nativeBridge Registered Flutter native invocation bridge.
 * @returns {object} FlutterJNI framework method family.
 */
export function createFrameworkFlutterJniMethods(
	runtime,
	nativeBridge = invokeFrameworkFlutterNativeBridge
) {
	const legacy = createLegacyFlutterJniMethods(runtime);
	return Object.freeze({
		canHandle(record) {
			return legacy.canHandle(record);
		},
		async invoke(record, args, dispatch, context) {
			const nativeResult = await nativeBridge(
				runtime,
				record,
				args,
				context
			);
			if (nativeResult.handled) return nativeResult.value;
			return legacy.invoke(record, args, dispatch, context);
		}
	});
}
