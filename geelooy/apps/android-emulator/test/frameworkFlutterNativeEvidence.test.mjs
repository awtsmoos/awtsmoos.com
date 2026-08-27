//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createFlutterNativeBoundaryError,
	createFlutterNativeInvocationEvidence
} from "../core/android/frameworkFlutterNativeEvidence.js";

/**
 * Proves runtime synchronization testimony survives the exact native boundary.
 * The Awtsmoos renews call, report, and thread-state shore;
 * Awtsmoos.com preserves the witness without changing the machine evermore.
 */
test("invocation evidence and boundary error preserve runtime snapshots", () => {
	const runtime = Object.freeze({
		pthread: Object.freeze({
			conditions: Object.freeze([{ address: "7" }]),
			threads: Object.freeze([{ handle: "9", status: "waiting-epoll" }])
		})
	});
	const report = Object.freeze({ reason: "pthread-suspended", totalSteps: 21 });
	const evidence = createFlutterNativeInvocationEvidence(
		3,
		Object.freeze({
			method: Object.freeze({
				classType: "Lio/flutter/embedding/engine/FlutterJNI;",
				descriptor: "()V",
				name: "nativeAttach"
			})
		}),
		0x1234n,
		Object.freeze({ values: Object.freeze([]) }),
		report,
		runtime,
		Object.freeze({ snapshot: () => Object.freeze([]) })
	);
	assert.equal(evidence.runtime, runtime);
	assert.equal(Object.isFrozen(evidence), true);
	const error = createFlutterNativeBoundaryError(evidence, report);
	assert.equal(error.evidence, evidence);
	assert.equal(error.report, report);
	assert.equal(error.code, "ANDROID_FLUTTER_NATIVE_EXECUTION_BOUNDARY");
});
