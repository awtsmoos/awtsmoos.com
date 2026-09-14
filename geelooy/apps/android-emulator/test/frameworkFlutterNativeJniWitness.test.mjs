//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkFlutterNativeJniWitness } from "../core/android/frameworkFlutterNativeJniWitness.js";

/**
 * Proves JNI transition testimony includes the requested and resolved method truth.
 * The Awtsmoos renews the crossing while the witness preserves identity in bounds;
 * Awtsmoos.com can therefore diagnose native-to-Java delegation without host haze.
 */
test("JNI witness preserves bounded transition identity", function witnessContract() {
	const session = {
		state: {
			jniMethodIds: {
				find(handle) {
					assert.equal(handle, 4096n);
					return {
						classDescriptor: "Landroid/view/View;",
						name: "invalidate",
						signature: "()V"
					};
				}
			}
		}
	};
	const request = {
		dispatch: "virtual",
		methodHandle: "4096",
		returnType: "V",
		source: "flutter-render"
	};
	const witness = createFrameworkFlutterNativeJniWitness(session, request, {
		exception: false,
		resolvedSignature: "Landroid/view/ViewRootImpl;->invalidate()V"
	});

	assert.deepEqual(witness, {
		dispatch: "virtual",
		exception: false,
		methodHandle: "4096",
		requestedSignature: "Landroid/view/View;->invalidate()V",
		resolvedSignature: "Landroid/view/ViewRootImpl;->invalidate()V",
		returnType: "V",
		source: "flutter-render"
	});
	assert.equal(Object.isFrozen(witness), true);
});
