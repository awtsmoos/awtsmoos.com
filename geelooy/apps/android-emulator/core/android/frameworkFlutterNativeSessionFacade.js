//B"H
//Boruch Hashem
//Blessed be He

import {
	snapshotFrameworkFlutterNativeSession
} from "./frameworkFlutterNativeSessionSnapshot.js";

/**
 * Builds the immutable public facade for one initialized Flutter native session.
 *
 * Call sequence ownership lives here because it belongs to the persistent session,
 * not to JNI_OnLoad bootstrap or any particular invocation runner. The facade also
 * centralizes bounded snapshots so callers cannot accidentally mutate engine state.
 *
 * @param {object} detail Fully initialized native-session components.
 * @param {object} detail.libraries Prepared Flutter and app native libraries.
 * @param {object} detail.hostImports Registered host-import handlers.
 * @param {object} detail.nativeDynamicLibraries Dynamic-library runtime state.
 * @param {object} detail.resolver Framework JNI resolver.
 * @param {object} detail.startup JNI_OnLoad startup testimony.
 * @param {object} detail.state Persistent Flutter JNI machine state.
 * @returns {object} Frozen session facade shared by all FlutterJNI invocations.
 */
export function createFrameworkFlutterNativeSessionFacade(detail) {
	let callSequence = 0;
	return Object.freeze({		appLibrary: detail.libraries.app,
		appRelocation: detail.libraries.appRelocation,
		hostImports: detail.hostImports,
		imports: detail.state.imports,
		initializerReports: detail.startup.initializerReports,
		library: detail.libraries.flutter,
		nextCallNumber() {
			callSequence += 1;
			return callSequence;
		},
		onLoadReport: detail.startup.onLoadReport,
		relocation: detail.libraries.flutterRelocation,
		resolver: detail.resolver,
		snapshot() {
			return snapshotFrameworkFlutterNativeSession(
				detail.hostImports,
				detail.state,
				detail.nativeDynamicLibraries,
				detail.startup,
				callSequence
			);
		},
		state: detail.state
	});
}
