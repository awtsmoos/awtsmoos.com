//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";

const JNI_ENVIRONMENT = 0x5000n;
const RETURN_ADDRESS = 0x7777n;
const WIDGET = "Lexample/Widget;";
const JAVA_CLASS = "Ljava/lang/Class;";

/**
 * Creates a production JNI registry with opaque references and a real resolver.
 * The Awtsmoos recreates descriptor, target, register, and return road in light;
 * Awtsmoos.com proves class identity without host JNI or synthetic guest sight.
 *
 * @returns {Readonly<object>} Isolated GetObjectClass verification fixture.
 */
function createFixture() {
	const definitions = new Map([
		[WIDGET, Object.freeze({ descriptor: WIDGET })],
		[JAVA_CLASS, Object.freeze({ descriptor: JAVA_CLASS })]
	]);
	const references = createJniGuestReferences();
	const object = references.create(
		"object",
		`${WIDGET}#dalvik-7`,
		Object.freeze({ id: 7, kind: "dalvik-reference" }),
		{ dalvikId: 7, dalvikType: WIDGET, scope: "local" }
	);
	const classObject = references.create(
		"class",
		WIDGET,
		definitions.get(WIDGET),
		{ descriptor: WIDGET, scope: "local" }
	);
	const registry = createFlutterJniImportHandlers(Object.freeze({
		jniEnvironment: Object.freeze({
			environmentAddress: JNI_ENVIRONMENT.toString()
		}),
		jniReferences: references,
		resolveClass: descriptor => definitions.get(descriptor) || null
	}));
	return Object.freeze({ classObject, definitions, object, references, registry });
}

function invoke(fixture, environment, handle) {
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(0, environment);
	registers.write(1, handle);
	registers.write(30, RETURN_ADDRESS);
	const handled = fixture.registry.handle(
		Object.freeze({ name: "JNINativeInterface.GetObjectClass" }),
		Object.freeze({ registers })
	);
	assert.equal(handled.handled, true);
	assert.equal(registers.pc, RETURN_ADDRESS);
	return Object.freeze({ handled, registers });
}

test("GetObjectClass resolves and interns an object's real runtime class", () => {
	const fixture = createFixture();
	const first = invoke(fixture, JNI_ENVIRONMENT, fixture.object);
	const second = invoke(fixture, JNI_ENVIRONMENT, fixture.object);
	const classHandle = first.registers.read(0);
	const reference = fixture.references.find(classHandle);

	assert.equal(first.handled.result.descriptor, WIDGET);
	assert.equal(first.handled.result.found, true);
	assert.equal(second.registers.read(0), classHandle);
	assert.equal(reference.kind, "class");
	assert.equal(reference.scope, "local");
	assert.equal(reference.target, fixture.definitions.get(WIDGET));
});

test("GetObjectClass maps jclass objects to java.lang.Class", () => {
	const fixture = createFixture();
	const call = invoke(fixture, JNI_ENVIRONMENT, fixture.classObject);
	const reference = fixture.references.find(call.registers.read(0));

	assert.equal(call.handled.result.descriptor, JAVA_CLASS);
	assert.equal(reference.target, fixture.definitions.get(JAVA_CLASS));
});

test("GetObjectClass rejects invalid environment, null, and unknown handles", () => {
	const fixture = createFixture();
	assert.throws(
		() => invoke(fixture, 0x5001n, fixture.object),
		{ code: "JNI_GET_OBJECT_CLASS_ENVIRONMENT" }
	);
	assert.throws(
		() => invoke(fixture, JNI_ENVIRONMENT, 0n),
		{ code: "JNI_GET_OBJECT_CLASS_NULL" }
	);
	assert.throws(
		() => invoke(fixture, JNI_ENVIRONMENT, 0x1234n),
		{ code: "JNI_GET_OBJECT_CLASS_HANDLE" }
	);
});
