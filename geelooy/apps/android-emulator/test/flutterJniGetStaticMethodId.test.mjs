//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createGetMethodIdFixture,
	invokeGetMethodId
} from "./flutterJniGetMethodIdFixture.mjs";

const LONG_CLASS = "Ljava/lang/Long;";
const VALUE_OF = "valueOf";
const VALUE_OF_SIGNATURE = "(J)Ljava/lang/Long;";

/**
 * Proves GetStaticMethodID returns stable opaque Long.valueOf identities.
 * The Awtsmoos recreates Long class, static garment, exact descriptor, and
 * jmethodID anew; Awtsmoos.com preserves local/global class equivalence and X30.
 */
test("GetStaticMethodID resolves Long.valueOf for local and global refs", () => {
	const target = frameworkLongTarget();
	const fixture = createGetMethodIdFixture(true, {
		classDescriptor: LONG_CLASS,
		name: VALUE_OF,
		signature: VALUE_OF_SIGNATURE,
		static: true,
		target
	});
	const local = invokeGetMethodId(fixture, fixture.local);
	const handle = fixture.registers.read(0);
	assert.equal(local.found, true);
	assert.equal(local.static, true);
	assert.equal(local.metadata.accessFlags, 0x0008);
	const global = invokeGetMethodId(fixture, fixture.global);
	assert.equal(global.handle, local.handle);
	assert.equal(fixture.registers.read(0), handle);
	assert.equal(fixture.methodIds.find(handle).target, target);
	assert.equal(fixture.methodIds.snapshot().length, 1);
});

test("missing static Long method returns null without registry mutation", () => {
	const fixture = createGetMethodIdFixture(false, {
		classDescriptor: LONG_CLASS,
		name: VALUE_OF,
		signature: VALUE_OF_SIGNATURE,
		static: true
	});
	const result = invokeGetMethodId(fixture, fixture.local);
	assert.equal(result.found, false);
	assert.equal(result.handle, "0");
	assert.equal(fixture.methodIds.snapshot().length, 0);
});

test("static and instance identities remain distinct", () => {
	const fixture = createGetMethodIdFixture(true, {
		classDescriptor: LONG_CLASS,
		name: VALUE_OF,
		signature: VALUE_OF_SIGNATURE,
		static: true
	});
	const staticResult = invokeGetMethodId(fixture, fixture.local);
	const staticHandle = BigInt(staticResult.handle);
	const instanceHandle = fixture.methodIds.intern({
		classDescriptor: LONG_CLASS,
		name: VALUE_OF,
		signature: VALUE_OF_SIGNATURE,
		static: false,
		target: Object.freeze({ instance: true })
	});
	assert.notEqual(staticHandle, instanceHandle);
});

function frameworkLongTarget() {
	return Object.freeze({
		framework: true,
		implementation: Object.freeze({
			accessFlags: 0x0008,
			family: "frameworkJavaLongs"
		}),
		method: Object.freeze({
			classType: LONG_CLASS,
			descriptor: VALUE_OF_SIGNATURE,
			index: null,
			name: VALUE_OF,
			prototype: Object.freeze({ index: null })
		})
	});
}
