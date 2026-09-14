//B"H
//Boruch Hashem
//Blessed be He

/**
 * @fileoverview Proves persistent Flutter session facades remain bounded and causal.
 *
 * The Awtsmoos renews call sequence and diagnostic testimony without exposing
 * mutable engine state. Awtsmoos.com keeps session identity independent from the
 * invocation runner while preserving mapped-library and JNI registry evidence.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	createFrameworkFlutterNativeSessionFacade
} from "../core/android/frameworkFlutterNativeSessionFacade.js";

/** Creates a registry-like object with one frozen diagnostic row. */
function registry(value) {
	return Object.freeze({
		snapshot() {
			return Object.freeze([value]);
		}
	});
}

/** Builds one deterministic initialized-session fixture without executing guest code. */
function createFixture() {
	const state = Object.freeze({
		imports: Object.freeze({ name: "imports" }),
		jniFieldIds: registry("field"),
		jniMethodIds: registry("method"),
		jniNativeMethods: registry("native"),
		jniReferences: registry("reference")
	});
	return Object.freeze({
		hostImports: Object.freeze({}),
		libraries: Object.freeze({
			app: Object.freeze({ name: "app" }),
			appRelocation: Object.freeze({ name: "app-relocation" }),
			flutter: Object.freeze({ name: "flutter" }),
			flutterRelocation: Object.freeze({ name: "flutter-relocation" })
		}),
		nativeDynamicLibraries: Object.freeze({
			mappedSnapshot() {
				return Object.freeze(["flutter", "app"]);
			}
		}),
		resolver: Object.freeze({ name: "resolver" }),
		startup: Object.freeze({
			initializerReports: Object.freeze(["initializer"]),
			onLoadReport: Object.freeze({ reason: "return" })
		}),
		state
	});
}
test("session facade owns call sequence and bounded snapshots", () => {
	const fixture = createFixture();
	const session = createFrameworkFlutterNativeSessionFacade(fixture);
	assert.equal(Object.isFrozen(session), true);
	assert.equal(session.state, fixture.state);
	assert.equal(session.imports, fixture.state.imports);
	assert.equal(session.appLibrary, fixture.libraries.app);
	assert.equal(session.library, fixture.libraries.flutter);
	assert.equal(session.nextCallNumber(), 1);
	assert.equal(session.nextCallNumber(), 2);
	const snapshot = session.snapshot();
	assert.equal(snapshot.callSequence, 2);
	assert.equal(snapshot.initializerCount, 1);
	assert.equal(snapshot.jniFieldIds, 1);
	assert.equal(snapshot.jniMethodIds, 1);
	assert.equal(snapshot.jniNativeMethods, 1);
	assert.equal(snapshot.jniReferences, 1);
	assert.deepEqual(snapshot.mappedLibraries, ["flutter", "app"]);
	assert.equal(snapshot.pthread.platformLooper, null);
});

test("facade exposes immutable startup identity without rebuilding state", () => {
	const fixture = createFixture();
	const session = createFrameworkFlutterNativeSessionFacade(fixture);
	assert.equal(session.initializerReports, fixture.startup.initializerReports);
	assert.equal(session.onLoadReport, fixture.startup.onLoadReport);
	assert.equal(session.resolver, fixture.resolver);
	assert.equal(session.appRelocation, fixture.libraries.appRelocation);
	assert.equal(session.relocation, fixture.libraries.flutterRelocation);
});
