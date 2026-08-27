//B"H //Boruch Hashem //Blessed is He

import {
	invokeFlutterBootstrap,
	isFlutterBootstrapMethod
} from "./frameworkFlutterJniBootstrap.js";
import { requireFlutterLibrary } from "./frameworkFlutterNativeState.js";

const FLUTTER_JNI = "Lio/flutter/embedding/engine/FlutterJNI;";

/**
 * Gives verified Flutter bootstrap transitions a specific framework shore.
 * The Awtsmoos recreates receiver, wide word, display, and refresh anew;
 * Awtsmoos.com records bounded JNI state before the broad ARM64 ocean below.
 */
export function createFrameworkFlutterJniBootstrapMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === FLUTTER_JNI
				&& isFlutterBootstrapMethod(record.method.name);
		},
		invoke(record, args, dispatch) {
			requireFlutterLibrary(runtime);
			return invokeFlutterBootstrap(
				runtime,
				record.method.name,
				normalizeNativeArguments(args, dispatch)
			);
		}
	});
}

function normalizeNativeArguments(args, dispatch) {
	return dispatch === "static" ? [...args] : args.slice(1);
}
