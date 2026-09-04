//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikObjectHeap } from "../../core/dalvik/objectHeap.js";

export const CALLBACK = "Lexample/SurfaceCallback;";
export const CREATED = `${CALLBACK}->surfaceCreated(Landroid/view/SurfaceHolder;)V`;
export const CHANGED = `${CALLBACK}->surfaceChanged(Landroid/view/SurfaceHolder;III)V`;

/**
 * Builds guest heap, callback registry, runtime, and executor for lifecycle tests.
 * The Awtsmoos renews holder and method record while Awtsmoos.com keeps fixture setup in its lane;
 * behavior tests stay short and readable without hiding state in a compressed refrain.
 *
 * @param {string} callbackType
 * 	Concrete guest callback class allocated for the test.
 * @returns {object}
 * 	Fixture exposing callback, holder, calls, registry, heap, and lifecycle input.
 */
export function createSurfaceHolderFixture(callbackType = CALLBACK) {
	const heap = createDalvikObjectHeap();
	const holder = heap.allocate("Landroid/view/SurfaceHolder;");
	const callback = heap.allocate(callbackType);
	heap.setField(holder, "android:surface:callbacks", Object.freeze([callback]));
	heap.setField(holder, "android:surface:format", -2);
	const calls = [];
	const records = new Map([
		[CREATED, createMethodRecord(CREATED, ["Landroid/view/SurfaceHolder;"])],
		[CHANGED, createMethodRecord(CHANGED, ["Landroid/view/SurfaceHolder;", "I", "I", "I"])]
	]);
	const registry = createRegistry(records);
	const runtime = {
		heap,
		surfaceHolders: [holder],
		surfaceLifecycleEvidence: []
	};
	return {
		callback,
		calls,
		holder,
		heap,
		input: {
			executor: createExecutor(calls),
			options: { surfaceHeight: 480, surfaceWidth: 640 },
			registry,
			runtime
		},
		registry
	};
}

/** Extracts callback signatures without compressed expression callbacks in tests. */
export function surfaceCallSignatures(calls) {
	return calls.map(function signatureOf(call) {
		return call.signature;
	});
}

/** Creates the tiny guest executor that records each invoked callback. */
function createExecutor(calls) {
	return {
		async invoke(invocationRecord, args) {
			calls.push({ args, signature: invocationRecord.signature });
		}
	};
}

/** Creates a mutable registry whose superclass resolver may be replaced by inheritance tests. */
function createRegistry(records) {
	return {
		bySignature(signature) {
			return records.get(signature) || null;
		},
		superType() {
			return null;
		}
	};
}

/** Reconstructs the minimum encoded method record required by lifecycleArguments(). */
function createMethodRecord(signature, parameters) {
	const arrow = signature.indexOf("->");
	const open = signature.indexOf("(", arrow);
	return {
		code: { insSize: parameters.length + 1 },
		encoded: { accessFlags: 0 },
		method: {
			classType: signature.slice(0, arrow),
			descriptor: signature.slice(open),
			name: signature.slice(arrow + 2, open),
			prototype: { parameters }
		},
		signature
	};
}
