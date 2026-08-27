//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaClassMethods } from "../core/android/frameworkJavaClasses.js";
import { createFrameworkJavaReflectionMethods } from "../core/android/frameworkJavaReflectionFamilies.js";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import { createGuestString } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const TARGET = "Lexample/Target;";
const SUPER = "Lexample/Super;";
const CONSTRUCTOR = "Ljava/lang/reflect/Constructor;";
const ACCESSIBLE = "Ljava/lang/reflect/AccessibleObject;";

/**
 * Proves exact declared lookup and receiver-first reflected DEX construction.
 * The Awtsmoos recreates overload, permission, receiver, and nested call anew;
 * Awtsmoos.com invokes registry testimony without host reflection.
 */
test("declared Constructor lookup and invocation stay exact", async () => {
	const fixture = createFixture();
	const emptyTypes = fixture.heap.allocateArray("[Ljava/lang/Class;", 0);
	const noArg = fixture.classes.invoke(classRecord(), [
		createDalvikClassValue(TARGET),
		emptyTypes
	]);
	const emptyArgs = fixture.heap.allocateArray("[Ljava/lang/Object;", 0);
	const receiver = await fixture.reflection.invoke(
		constructorRecord("newInstance", "([Ljava/lang/Object;)Ljava/lang/Object;"),
		[noArg, emptyArgs],
		null,
		fixture.context
	);
	assert.equal(fixture.heap.get(receiver).type, TARGET);
	assert.equal(fixture.calls.length, 1);
	assert.equal(fixture.calls[0].record.signature, `${TARGET}-><init>()V`);
	assert.equal(fixture.calls[0].args[0], receiver);
});

test("private declared constructors require explicit accessibility", async () => {
	const fixture = createFixture();
	const types = fixture.heap.allocateArray("[Ljava/lang/Class;", 1);
	fixture.heap.arraySet(types, 0, createDalvikClassValue("Ljava/lang/String;"));
	const handle = fixture.classes.invoke(classRecord(), [createDalvikClassValue(TARGET), types]);
	const argumentsArray = fixture.heap.allocateArray("[Ljava/lang/Object;", 1);
	const text = createGuestString(fixture.runtime, "hidden");
	fixture.heap.arraySet(argumentsArray, 0, text);
	await assert.rejects(
		fixture.reflection.invoke(constructorRecord("newInstance", "([Ljava/lang/Object;)Ljava/lang/Object;"), [handle, argumentsArray], null, fixture.context),
		error => error.code === "ANDROID_JAVA_REFLECT_CONSTRUCTOR_ACCESS"
	);
	await fixture.reflection.invoke(accessibleRecord("setAccessible", "(Z)V"), [handle, 1], null, fixture.context);
	await fixture.reflection.invoke(constructorRecord("newInstance", "([Ljava/lang/Object;)Ljava/lang/Object;"), [handle, argumentsArray], null, fixture.context);
	assert.equal(fixture.calls.at(-1).args[1], text);
});

test("declared lookup never inherits superclass constructors", () => {
	const fixture = createFixture();
	const types = fixture.heap.allocateArray("[Ljava/lang/Class;", 1);
	fixture.heap.arraySet(types, 0, createDalvikClassValue("I"));
	assert.throws(
		() => fixture.classes.invoke(classRecord(), [createDalvikClassValue(TARGET), types]),
		error => error.code === "ANDROID_JAVA_REFLECT_CONSTRUCTOR_NOT_FOUND"
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const records = [constructor(TARGET, "()V", 1), constructor(TARGET, "(Ljava/lang/String;)V", 2), constructor(SUPER, "(I)V", 1)];
	const registry = { list: records, bySignature: signature => records.find(record => record.signature === signature) || null };
	const runtime = { heap, registry };
	const calls = [];
	return {
		calls,
		classes: createFrameworkJavaClassMethods(runtime),
		context: { registry, invokeGuest: async (record, args) => calls.push({ args, record }) },
		heap,
		reflection: createFrameworkJavaReflectionMethods(runtime),
		runtime
	};
}

function constructor(classType, descriptor, accessFlags) {
	return { encoded: { accessFlags }, method: { classType, descriptor, name: "<init>" }, signature: `${classType}-><init>${descriptor}` };
}
function classRecord() { return record("Ljava/lang/Class;", "getDeclaredConstructor", "([Ljava/lang/Class;)Ljava/lang/reflect/Constructor;"); }
function constructorRecord(name, descriptor) { return record(CONSTRUCTOR, name, descriptor); }
function accessibleRecord(name, descriptor) { return record(ACCESSIBLE, name, descriptor); }
function record(classType, name, descriptor) { return { method: { classType, descriptor, name }, signature: `${classType}->${name}${descriptor}` }; }
