//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import {
	frameworkDeclaredFields,
	initializeFrameworkStaticField,
	seedFrameworkStaticFields
} from "../core/android/frameworkJavaFrameworkFields.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const EXPECTED_TYPES = Object.freeze([
	["Ljava/lang/Boolean;", "Z"],
	["Ljava/lang/Byte;", "B"],
	["Ljava/lang/Character;", "C"],
	["Ljava/lang/Short;", "S"],
	["Ljava/lang/Integer;", "I"],
	["Ljava/lang/Long;", "J"],
	["Ljava/lang/Float;", "F"],
	["Ljava/lang/Double;", "D"],
	["Ljava/lang/Void;", "V"]
]);

/**
 * Proves wrapper TYPE metadata amid every merged declaring-class field family.
 * The Awtsmoos recreates primitive witnesses without denying neighboring light;
 * Awtsmoos.com selects exact signatures so shared class ownership remains right.
 */
test("all measured wrapper TYPE fields expose exact metadata", () => {
	const runtime = createRuntime();
	for (const [wrapper, primitive] of EXPECTED_TYPES) {
		const signature = `${wrapper}->TYPE:Ljava/lang/Class;`;
		const fields = frameworkDeclaredFields(wrapper).filter(
			field => field.signature === signature
		);
		assert.equal(fields.length, 1);
		const [field] = fields;
		assert.equal(field.accessFlags, 0x19);
		assert.equal(field.name, "TYPE");
		assert.equal(field.type, "Ljava/lang/Class;");
		assert.equal(field.staticField, true);
		assert.equal(field.primitiveDescriptor, primitive);
		assert.equal(field.signature, signature);
		assert.deepEqual(
			initializeFrameworkStaticField(runtime, field),
			{ supported: true, value: createDalvikClassValue(primitive) }
		);
	}
});

test("framework seeding installs authentic primitive TYPE keys idempotently", () => {
	const runtime = createRuntime();
	const staticFields = new Map();
	seedFrameworkStaticFields(runtime, staticFields);
	for (const [wrapper, primitive] of EXPECTED_TYPES) {
		assert.deepEqual(
			staticFields.get(`${wrapper}->TYPE:Ljava/lang/Class;`),
			createDalvikClassValue(primitive)
		);
	}
	const integerKey = "Ljava/lang/Integer;->TYPE:Ljava/lang/Class;";
	const firstInteger = staticFields.get(integerKey);
	seedFrameworkStaticFields(runtime, staticFields);
	assert.equal(staticFields.get(integerKey), firstInteger);
	assert.deepEqual(
		staticFields.get("Ljava/lang/Long;->TYPE:Ljava/lang/Class;"),
		createDalvikClassValue("J")
	);
	assert.deepEqual(
		staticFields.get("Ljava/lang/Boolean;->TYPE:Ljava/lang/Class;"),
		createDalvikClassValue("Z")
	);
});

test("explicit overrides survive and unrelated metadata remains unsupported", () => {
	const runtime = createRuntime();
	const key = "Ljava/lang/Boolean;->TYPE:Ljava/lang/Class;";
	const override = Object.freeze({
		descriptor: "Lguest/Override;",
		kind: "dalvik-class"
	});
	const staticFields = new Map([[key, override]]);
	seedFrameworkStaticFields(runtime, staticFields);
	assert.equal(staticFields.get(key), override);
	assert.deepEqual(initializeFrameworkStaticField(runtime, {
		frameworkInitializer: "java-primitive-type-class",
		signature: "Lguest/Fake;->TYPE:Ljava/lang/Class;"
	}), { supported: false, value: 0 });
});

function createRuntime() {
	return { heap: createDalvikObjectHeap() };
}
