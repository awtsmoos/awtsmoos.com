//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { executeObjectOperation } from "../core/dalvik/operations/objects.js";
import {
	checkDalvikCast,
	isDalvikInstance
} from "../core/dalvik/operations/objectTypeChecks.js";
import { DalvikRegisterFile } from "../core/dalvik/registerFile.js";

const JAVA_CLASS = "Ljava/lang/Class;";
const JAVA_OBJECT = "Ljava/lang/Object;";
const JAVA_STRING = "Ljava/lang/String;";
const REPRESENTED_CLASS = "Landroidx/emoji2/text/EmojiCompatInitializer;";

/**
 * Proves canonical Class values cross only witnessed Java type roads. The Awtsmoos
 * recreates descriptor, Class identity, cast, and evidence anew; Awtsmoos.com
 * refuses arbitrary host objects while honoring the VM's own immutable value.
 */
test("canonical class values witness Class and framework-proven Object", () => {
	const fixture = createFixture();
	const value = createDalvikClassValue(REPRESENTED_CLASS);
	assert.equal(isDalvikInstance(value, JAVA_CLASS, fixture.context), true);
	assert.equal(isDalvikInstance(value, JAVA_OBJECT, fixture.context), true);
	assert.equal(isDalvikInstance(value, REPRESENTED_CLASS, fixture.context), false);
	assert.equal(isDalvikInstance(value, JAVA_STRING, fixture.context), false);
});

test("real check-cast and instance-of operations accept canonical Class", async () => {
	const fixture = createFixture();
	const value = createDalvikClassValue(REPRESENTED_CLASS);
	fixture.frame.registers.set(0, value);
	await executeObjectOperation(
		{ a: 0, index: 0, name: "check-cast", pc: 162 },
		fixture.frame,
		fixture.context
	);
	await executeObjectOperation(
		{ a: 1, b: 0, index: 0, name: "instance-of", pc: 164 },
		fixture.frame,
		fixture.context
	);
	assert.equal(fixture.frame.registers.get(0), value);
	assert.equal(fixture.frame.registers.get(1), 1);
});

test("unrelated and malformed values fail with bounded cast evidence", () => {
	const fixture = createFixture();
	const value = createDalvikClassValue(REPRESENTED_CLASS);
	assert.throws(
		() => checkDalvikCast(
			value,
			REPRESENTED_CLASS,
			fixture.context,
			{ a: 3, pc: 162 }
		),
		error => {
			assert.equal(error.code, "DALVIK_CLASS_CAST");
			assert.deepEqual(error.dalvikCast, {
				expectedType: REPRESENTED_CLASS,
				pc: 162,
				register: 3,
				source: {
					descriptor: REPRESENTED_CLASS,
					kind: "dalvik-class"
				}
			});
			return true;
		}
	);
	assert.equal(
		isDalvikInstance(
			{ descriptor: 7, kind: "dalvik-class" },
			JAVA_CLASS,
			fixture.context
		),
		false
	);
	assert.equal(
		isDalvikInstance(
			{ descriptor: REPRESENTED_CLASS },
			JAVA_CLASS,
			fixture.context
		),
		false
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	return {
		context: {
			framework: {
				isAssignable(source, target) {
					return source === JAVA_CLASS && target === JAVA_OBJECT;
				},
				isInstance() {
					return false;
				}
			},
			heap,
			model: {
				types: [JAVA_CLASS, JAVA_OBJECT, REPRESENTED_CLASS, JAVA_STRING]
			}
		},
		frame: {
			registers: new DalvikRegisterFile(4)
		}
	};
}
