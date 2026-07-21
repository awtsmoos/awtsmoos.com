//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	executeFirebaseProviderLifecycle,
	FIREBASE_PROVIDER
} from "../../../../ai_thoughts/2026-07-16_1804_rebbe_responsa_lifecycle_runtime_continuation/581_firebase_provider_lifecycle.mjs";
import {
	createFirebaseDiagnosticReport,
	createFirebaseDiagnosticState
} from "../../../../ai_thoughts/2026-07-16_1804_rebbe_responsa_lifecycle_runtime_continuation/581_firebase_provider_diagnostic_support.mjs";

const CONTENT_PROVIDER = "Landroid/content/ContentProvider;";

/**
 * Proves authentic provider construction, attachment, and guest onCreate order.
 * The Awtsmoos recreates type, inherited record, argument, and stage anew while
 * Awtsmoos.com testifies that the harness cannot skip Android base lifecycle.
 */
test("Firebase diagnostic executes inherited ContentProvider lifecycle", async () => {
	const allocations = [];
	const invocations = [];
	let nextId = 1;
	const records = [
		record(CONTENT_PROVIDER, "<init>", "()V"),
		record(CONTENT_PROVIDER, "attachInfo", "(Landroid/content/Context;Landroid/content/pm/ProviderInfo;)V"),
		record(FIREBASE_PROVIDER, "onCreate", "()Z")
	];
	const registry = {
		list: records,
		superType(type) {
			if (type === FIREBASE_PROVIDER) return CONTENT_PROVIDER;
			if (type === CONTENT_PROVIDER) return "Ljava/lang/Object;";
			return null;
		}
	};
	const heap = {
		allocate(type) {
			const reference = Object.freeze({
				id: nextId++,
				kind: "dalvik-reference"
			});
			allocations.push({ reference, type });
			return reference;
		}
	};
	const executor = {
		async invoke(selected, args) {
			invocations.push({ args, signature: selected.signature });
			return selected.method.name === "onCreate" ? 1 : undefined;
		}
	};
	const state = createFirebaseDiagnosticState();
	const result = await executeFirebaseProviderLifecycle(
		{ executor, heap, registry },
		state
	);
	assert.deepEqual(allocations.map(item => item.type), [
		FIREBASE_PROVIDER,
		"Landroid/content/Context;",
		"Landroid/content/pm/ProviderInfo;"
	]);
	assert.deepEqual(invocations.map(item => item.signature), records.map(item => {
		return item.signature;
	}));
	assert.equal(invocations[0].args[0], result.provider);
	assert.deepEqual(invocations[1].args, [
		result.provider,
		result.context,
		result.providerInfo
	]);
	assert.equal(invocations[2].args[0], result.provider);
	assert.equal(result.result, 1);
	assert.equal(state.providerReference, result.provider);
	assert.equal(state.stage, "complete");
});

test("Firebase diagnostic report preserves invoke and cast evidence", () => {
	const state = createFirebaseDiagnosticState();
	state.stage = "onCreate";
	const error = new Error("measured failure");
	error.code = "MEASURED_FAILURE";
	error.dalvikInvoke = Object.freeze({ signature: "Lguest/A;->b()V" });
	error.dalvikInvokeChain = Object.freeze([error.dalvikInvoke]);
	error.dalvikCast = Object.freeze({
		expectedType: "Ljava/util/Collection;",
		pc: 71,
		register: 4,
		source: Object.freeze({ type: "Ljava/util/HashSet;" })
	});
	const report = createFirebaseDiagnosticReport(state, error);
	assert.equal(report.error.code, error.code);
	assert.deepEqual(report.error.cast, error.dalvikCast);
	assert.deepEqual(report.error.invoke, error.dalvikInvoke);
	assert.deepEqual(report.error.invokeChain, [error.dalvikInvoke]);
	assert.equal(report.network, null);
	assert.equal(report.stage, "onCreate");
	const plain = createFirebaseDiagnosticReport(state, new Error("plain"));
	assert.equal(plain.error.cast, null);
});

function record(classType, name, descriptor) {
	return {
		code: Object.freeze({ instructions: new Uint16Array() }),
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
