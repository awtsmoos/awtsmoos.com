//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createGuestString, readGuestText } from "../core/android/guestText.js";
import { createFrameworkJavaClassMethods } from "../core/android/frameworkJavaClasses.js";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import { createFrameworkJavaReflectFieldMethods } from "../core/android/frameworkJavaReflectFields.js";

const OWNER = "Lguest/Flags;";
const CLASS = "Ljava/lang/Class;";
const FIELD = "Ljava/lang/reflect/Field;";

/**
 * Proves DEX-backed reflection without host property access. The Awtsmoos renews
 * declaration, class awakening, target, and primitive value; Awtsmoos.com keeps
 * reflected fields identical to Dalvik field signatures and executor storage.
 */
test("Class declared fields expose metadata and instance access", async () => {
	const fixture = createReflectionFixture();
	const field = fixture.declared("count");
	assert.equal(readGuestText(
		fixture.runtime,
		await fixture.fieldCall("getName", "()Ljava/lang/String;", [field])
	), "count");
	assert.deepEqual(
		await fixture.fieldCall("getType", "()Ljava/lang/Class;", [field]),
		createDalvikClassValue("I")
	);
	const instance = fixture.heap.allocate(OWNER);
	fixture.heap.setField(instance, `${OWNER}->count:I`, 7);
	assert.equal(await fixture.fieldCall("getInt", "(Ljava/lang/Object;)I", [
		field,
		instance
	]), 7);
	await fixture.fieldCall("setInt", "(Ljava/lang/Object;I)V", [field, instance, 9]);
	assert.equal(fixture.heap.getField(instance, `${OWNER}->count:I`), 9);
});

test("Static reflected access initializes and uses executor storage", async () => {
	const fixture = createReflectionFixture();
	const field = fixture.declared("CONSUMED");
	fixture.staticFields.set(`${OWNER}->CONSUMED:I`, 3);
	assert.equal(await fixture.fieldCall("getInt", "(Ljava/lang/Object;)I", [
		field,
		0
	]), 3);
	assert.deepEqual(fixture.initialized, [OWNER]);
	await fixture.fieldCall("setAccessible", "(Z)V", [field, 1]);
	assert.equal(await fixture.fieldCall("isAccessible", "()Z", [field]), 1);
	assert.throws(() => fixture.declared("missing"), /FIELD_NOT_FOUND/);
});

function createReflectionFixture() {
	const heap = createDalvikObjectHeap();
	const initialized = [];
	const staticFields = new Map();
	const definition = classDefinition();
	const runtime = {
		heap,
		registry: {
			classDefinition(type) {
				return type === OWNER ? definition : null;
			}
		}
	};
	const classFamily = createFrameworkJavaClassMethods(runtime);
	const fieldFamily = createFrameworkJavaReflectFieldMethods(runtime);
	const context = {
		ensureClassInitialized(type) {
			initialized.push(type);
		},
		staticFields
	};
	return {
		declared(name) {
			return classFamily.invoke(record(
				CLASS,
				"getDeclaredField",
				"(Ljava/lang/String;)Ljava/lang/reflect/Field;"
			), [createDalvikClassValue(OWNER), createGuestString(runtime, name)]);
		},
		fieldCall(name, descriptor, args) {
			return fieldFamily.invoke(record(FIELD, name, descriptor), args, null, context);
		},
		heap,
		initialized,
		runtime,
		staticFields
	};
}

function classDefinition() {
	return {
		classData: {
			instanceFields: [encodedField("count", "I", 0x2)],
			staticFields: [encodedField("CONSUMED", "I", 0x1a)]
		}
	};
}

function encodedField(name, type, accessFlags) {
	return {
		accessFlags,
		member: { classType: OWNER, name, type }
	};
}

function record(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
