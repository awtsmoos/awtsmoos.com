//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { executeInvokeOperation } from "../core/dalvik/operations/invokes.js";
import { classDefinition, createDispatchFixture, methodRecord } from "./dalvikDispatchFixture.mjs";

/**
 * Proves invoke-interface execution and current resolution testimony. The Awtsmoos
 * recreates declaration, receiver, resolved signature, and result every instant;
 * Awtsmoos.com keeps trace evidence synchronized with the method actually run.
 */
test("invoke-interface executes and traces the resolved guest method", async () => {
	const declared = methodRecord("Ltest/I;", "call", "()V", false);
	const implementation = methodRecord("Ltest/Impl;", "call");
	let invoked = null;
	let traced = null;
	const fixture = createDispatchFixture({
		definitions: [
			classDefinition("Ljava/lang/Object;"),
			classDefinition("Ltest/I;", "Ljava/lang/Object;"),
			classDefinition("Ltest/Impl;", "Ljava/lang/Object;", ["Ltest/I;"])
		],
		invokeGuest(record) {
			invoked = record;
			return 7;
		},
		records: [declared, implementation],
		traceCall(call) {
			traced = call;
		}
	});
	const receiver = fixture.receiver("Ltest/Impl;");
	const frame = createFrame(receiver);
	await executeInvokeOperation({ index: 0, name: "invoke-interface", pc: 4, registers: [0] }, frame, fixture.context);
	assert.equal(invoked, implementation);
	assert.equal(frame.pendingResult, 7);
	assert.deepEqual(traced, {
		argumentCount: 1,
		declaredSignature: declared.signature,
		dispatch: "interface",
		guestCode: true,
		receiverType: "Ltest/Impl;",
		resolution: "class-hierarchy",
		resolvedSignature: implementation.signature,
		signature: implementation.signature
	});
});

test("failed invokes preserve receiver and resolution evidence", async () => {
	const declared = methodRecord("Ltest/I;", "call", "()V", false);
	const fixture = createDispatchFixture({
		definitions: [
			classDefinition("Ljava/lang/Object;"),
			classDefinition("Ltest/I;", "Ljava/lang/Object;"),
			classDefinition("Ltest/Other;", "Ljava/lang/Object;")
		],
		records: [declared]
	});
	const receiver = fixture.receiver("Ltest/Other;");
	await assert.rejects(
		executeInvokeOperation({ index: 0, name: "invoke-interface", pc: 8, registers: [0] }, createFrame(receiver), fixture.context),
		error => {
			assert.equal(error.code, "DALVIK_INTERFACE_RECEIVER_MISMATCH");
			assert.equal(error.dalvikInvoke.receiverType, "Ltest/Other;");
			assert.equal(error.dalvikInvoke.declaredSignature, declared.signature);
			assert.equal(error.dalvikInvoke.resolution, "resolution-failed");
			return true;
		}
	);
});

function createFrame(receiver) {
	return {
		pendingResult: null,
		registers: { getMany: () => [receiver] }
	};
}
