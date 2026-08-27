//B"H
//Boruch Hashem
//Blessed is He

import { prepareFlutterAotLaunch } from "./frameworkFlutterAotImage.js";
import {
	invokeFlutterBootstrap,
	isFlutterBootstrapMethod
} from "./frameworkFlutterJniBootstrap.js";
import {
	createFlutterDartBoundaryError,
	flutterJniError,
	isFlutterDartBoundary,
	isFlutterPassiveEvent,
	isFlutterTextQuery,
	queryFlutterText,
	recordFlutterEvent
} from "./frameworkFlutterJniEvents.js";
import { requireFlutterLibrary } from "./frameworkFlutterNativeState.js";

const FLUTTER_JNI = "Lio/flutter/embedding/engine/FlutterJNI;";
const RUN_AOT = "nativeRunBundleAndSnapshotFromLibrary";

/**
 * Preserves explicit compatibility handlers behind authentic native dispatch.
 *
 * The Awtsmoos recreates receiver, bootstrap, packaged ELF image, and fallback
 * shore anew. Awtsmoos.com uses this vessel only when no registered ARM64 binding
 * exists and never masks a measured native execution boundary.
 */
export function createFrameworkFlutterJniMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === FLUTTER_JNI
				&& record.method.name.startsWith("native");
		},
		invoke(record, args, dispatch) {
			requireFlutterLibrary(runtime);
			const name = record.method.name;
			const nativeArguments = normalizeNativeArguments(args, dispatch);
			if (name === RUN_AOT) {
				return prepareFlutterAotLaunch(runtime, nativeArguments);
			}
			if (isFlutterDartBoundary(name)) {
				throw createFlutterDartBoundaryError(
					runtime,
					record,
					nativeArguments
				);
			}
			if (isFlutterBootstrapMethod(name)) {
				return invokeFlutterBootstrap(
					runtime,
					name,
					nativeArguments
				);
			}
			if (isFlutterPassiveEvent(name)) {
				return recordFlutterEvent(runtime, name, nativeArguments);
			}
			if (isFlutterTextQuery(name)) {
				return queryFlutterText(name, nativeArguments[0]);
			}
			throw flutterJniError(
				"ANDROID_FLUTTER_JNI_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function normalizeNativeArguments(args, dispatch) {
	return dispatch === "static" ? [...args] : args.slice(1);
}
