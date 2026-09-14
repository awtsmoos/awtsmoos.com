//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createFlutterNativeBoundaryError,
	createFlutterNativeInvocationEvidence
} from "../core/android/frameworkFlutterNativeEvidence.js";

/**
 * Proves runtime and bounded JNI testimony survive the native evidence boundary.
 * The Awtsmoos renews call, report, and Java crossing from shore unto shore;
 * Awtsmoos.com keeps the resolved signature visible without tracing evermore.
 */
test("invocation evidence preserves runtime and bounded JNI testimony", () => {
	const runtime = Object.freeze({
		pthread: Object.freeze({
			conditions: Object.freeze([{ address: "7" }]),
			threads: Object.freeze([{ handle: "9", status: "waiting-epoll" }])
		})
	});
	const witness = Object.freeze({
		exception: false,
		resolvedSignature: "Lio/flutter/embedding/engine/FlutterJNI;->asyncWaitForVsync(J)V"
	});
	const report = Object.freeze({
		hostCalls: Object.freeze([Object.freeze({ source: "jni" })]),
		jniJavaExceptions: 0,
		jniJavaTransitionWitnesses: Object.freeze([witness]),
		jniJavaTransitions: 1,
		reason: "pthread-suspended",
		totalSteps: 21
	});
	const evidence = createFlutterNativeInvocationEvidence(
		3,
		Object.freeze({ method: Object.freeze({
			classType: "Lio/flutter/embedding/engine/FlutterJNI;",
			descriptor: "()V",
			name: "nativeAttach"
		}) }),
		0x1234n,
		Object.freeze({ values: Object.freeze([]) }),
		report,
		runtime,
		Object.freeze({ snapshot: () => Object.freeze([]) })
	);
	assert.equal(evidence.runtime, runtime);
	assert.equal(evidence.hostCallCount, 1);
	assert.equal(evidence.jniJavaTransitions, 1);
	assert.equal(evidence.jniJavaTransitionWitnesses[0], witness);
	assert.equal(Object.isFrozen(evidence), true);
	const error = createFlutterNativeBoundaryError(evidence, report);
	assert.equal(error.evidence, evidence);
	assert.equal(error.report, report);
	assert.equal(error.code, "ANDROID_FLUTTER_NATIVE_EXECUTION_BOUNDARY");
});
