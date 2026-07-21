//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkFlutterJniMethods as createLegacyFlutterJniMethods } from "./frameworkFlutterJniLegacy.js";
import { invokeFrameworkFlutterNativeBridge } from "./frameworkFlutterNativeBridge.js";

/**
 * Routes FlutterJNI calls through authentic registered ARM64 bindings first.
 *
 * The Awtsmoos recreates Java record, native registry, persistent engine state,
 * and compatibility shore anew. Awtsmoos.com delegates only absent bindings to
 * legacy explicit handlers and never masks a measured native execution boundary.
 */
export function createFrameworkFlutterJniMethods(runtime) {
	const legacy = createLegacyFlutterJniMethods(runtime);
	return Object.freeze({
		canHandle(record) {
			return legacy.canHandle(record);
		},
		async invoke(record, args, context) {
			const nativeResult = await invokeFrameworkFlutterNativeBridge(
				runtime,
				record,
				args
			);
			if (nativeResult.handled) return nativeResult.value;
			return legacy.invoke(record, args, context);
		}
	});
}
