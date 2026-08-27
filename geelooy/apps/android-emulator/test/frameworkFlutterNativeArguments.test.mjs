//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { placeFlutterNativeArguments } from "../core/android/frameworkFlutterNativeArguments.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { readAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";

/**
 * Proves independent AAPCS64 general/SIMD allocation and aligned stack spills.
 *
 * The Awtsmoos recreates X register, V register, mixed Java order, spill slot,
 * and refusal anew; Awtsmoos.com uses only synthetic CPU and guest memory here.
 */
test("mixed JNI values allocate independently to X and V registers", () => {
	const fixture = createArgumentFixture();
	const result = placeFlutterNativeArguments({
		...fixture,
		parameterTypes: ["I", "F", "Ljava/lang/Object;", "D", "J"],
		values: [-1, 60, "guest-object", Math.PI, 9n]
	});
	assert.equal(fixture.registers.read(0), 0x5000n);
	assert.equal(fixture.registers.read(1), 0x6000n);
	assert.equal(fixture.registers.read(2), 0xffffffffffffffffn);
	assert.equal(fixture.registers.read(3), 0xabcdn);
	assert.equal(fixture.registers.read(4), 9n);
	assert.equal(fixture.registers.readFloat(0, 32), 60);
	assert.equal(fixture.registers.readFloat(1, 64), Math.PI);
	assert.equal(result.generalRegisterCount, 3);
	assert.equal(result.simdRegisterCount, 2);
	assert.equal(result.spillCount, 0);
	assert.deepEqual(
		result.locations.map(item => item.kind),
		["general", "simd", "general", "simd", "general"]
	);
});

test("general and SIMD exhaustion spill in original parameter order", () => {
	const fixture = createArgumentFixture(0x8000n);
	const generalTypes = Array.from({ length: 7 }, () => "I");
	const floatTypes = Array.from({ length: 9 }, () => "F");
	const result = placeFlutterNativeArguments({
		...fixture,
		parameterTypes: [...generalTypes, ...floatTypes],
		values: [1, 2, 3, 4, 5, 6, 7, 0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5]
	});
	assert.equal(result.generalRegisterCount, 6);
	assert.equal(result.simdRegisterCount, 8);
	assert.equal(result.spillCount, 2);
	assert.equal(fixture.registers.sp, 0x7ff0n);
	assert.equal(readAarch64Integer(fixture.memory, 0x7ff0n, 64), 7n);
	assert.equal(readAarch64Integer(fixture.memory, 0x7ff8n, 64), 0x41080000n);
	assert.deepEqual(
		result.locations.filter(item => item.kind === "stack").map(item => item.parameterIndex),
		[6, 15]
	);
});

test("arity and unknown-type failures occur before CPU mutation", () => {
	const fixture = createArgumentFixture(0x7000n);
	fixture.registers.write(0, 0xdeadn);
	fixture.registers.writeFloat(0, 3.5, 32);
	assert.throws(
		() => placeFlutterNativeArguments({
			...fixture,
			parameterTypes: ["V"],
			values: [1]
		}),
		/ANDROID_FLUTTER_NATIVE_ARGUMENT_TYPE/
	);
	assert.equal(fixture.registers.read(0), 0xdeadn);
	assert.equal(fixture.registers.readFloat(0, 32), 3.5);
	assert.equal(fixture.registers.sp, 0n);
	assert.throws(
		() => placeFlutterNativeArguments({
			...fixture,
			parameterTypes: ["I"],
			values: []
		}),
		/ANDROID_FLUTTER_NATIVE_ARGUMENT_ARITY/
	);
});

function createArgumentFixture(stackTop = 0x7000n) {
	return {
		environmentHandle: 0x5000n,
		marshalReference(value) {
			assert.equal(value, "guest-object");
			return 0xabcdn;
		},
		memory: createNativeAnonymousMemory(0x6000n, 0x3000, "native-args"),
		receiverHandle: 0x6000n,
		registers: createAarch64Registers(),
		stackTop
	};
}
