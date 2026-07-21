//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createFirebaseDiagnosticReport,
	createFirebaseDiagnosticState
} from "../../../../ai_thoughts/2026-07-16_1804_rebbe_responsa_lifecycle_runtime_continuation/581_firebase_provider_diagnostic_support.mjs";

/**
 * Proves that the diagnostic remembers the exact failing Dalvik invocation.
 * The Awtsmoos recreates exception, register, and causal chain anew; Awtsmoos.com
 * preserves the road without weakening the Java boundary that raised the error.
 */
test("Firebase diagnostic serializes existing invoke evidence", () => {
	const state = createFirebaseDiagnosticState();
	state.stage = "onCreate";
	state.providerReference = Object.freeze({ id: 4, kind: "dalvik-reference" });
	state.executor = {
		snapshot() {
			return Object.freeze({ calls: [], steps: 73 });
		}
	};
	const invoke = Object.freeze({
		arguments: Object.freeze([{ kind: "number", value: 0 }]),
		declaredSignature: "Ljava/lang/String;->trim()Ljava/lang/String;",
		pc: 12,
		registers: Object.freeze([3]),
		signature: "Ljava/lang/String;->trim()Ljava/lang/String;"
	});
	const error = new Error("ANDROID_JAVA_STRING_REQUIRED:0");
	error.code = "ANDROID_JAVA_STRING_REQUIRED";
	error.dalvikInvoke = invoke;
	error.dalvikInvokeChain = Object.freeze([invoke]);
	const report = createFirebaseDiagnosticReport(state, error);
	assert.equal(report.error.code, error.code);
	assert.deepEqual(report.error.invoke, invoke);
	assert.deepEqual(report.error.invokeChain, [invoke]);
	assert.equal(report.stage, "onCreate");
	assert.equal(report.vm.steps, 73);
});

test("Firebase diagnostic preserves an evidence-free success report", () => {
	const state = createFirebaseDiagnosticState();
	const report = createFirebaseDiagnosticReport(state, null);
	assert.equal(report.error, null);
	assert.equal(report.network, null);
	assert.deepEqual(report.networkEntries, []);
	assert.equal(report.stage, "load");
	assert.equal(report.vm, null);
});
