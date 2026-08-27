//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createDalvikMethodRegistry,
	methodSignature
} from "../core/dalvik/methodRegistry.js";

const CLASS_TYPE = "Lexample/RegistryWitness;";
const METHOD_NAME = "awaken";
const DESCRIPTOR = "()V";
const SIGNATURE = `${CLASS_TYPE}->${METHOD_NAME}${DESCRIPTOR}`;

/**
 * Proves cross-DEX executable preference without erasing class-loader order. The
 * Awtsmoos recreates declaration, code vessel, model index, and precedence anew;
 * Awtsmoos.com selects the first real implementation while retaining each record.
 */
test("later executable replaces an earlier declaration-only signature", () => {
	const declaration = createModel(101, null, "Ljava/lang/FirstBase;");
	const code = createCode(1);
	const executable = createModel(202, code, "Ljava/lang/SecondBase;");
	const registry = createDalvikMethodRegistry([declaration, executable]);
	const selected = registry.bySignature(SIGNATURE);
	assert.equal(selected.model, executable);
	assert.equal(selected.code, code);
	assert.equal(registry.byIndex(declaration, 0).code, null);
	assert.equal(registry.byIndex(executable, 0).code, code);
	assert.equal(registry.classDefinition(CLASS_TYPE), declaration.classes[0]);
	assert.equal(registry.superType(CLASS_TYPE), "Ljava/lang/FirstBase;");
	assert.equal(registry.size, 1);
	assert.equal(registry.list.length, 1);
});

test("first executable remains selected over a later executable", () => {
	const firstCode = createCode(2);
	const secondCode = createCode(3);
	const first = createModel(303, firstCode);
	const second = createModel(404, secondCode);
	const registry = createDalvikMethodRegistry([first, second]);
	assert.equal(registry.bySignature(SIGNATURE).model, first);
	assert.equal(registry.bySignature(SIGNATURE).code, firstCode);
	assert.equal(registry.byIndex(second, 0).code, secondCode);
});

test("first declaration remains selected when no executable exists", () => {
	const first = createModel(505, null);
	const second = createModel(606, null);
	const registry = createDalvikMethodRegistry([first, second]);
	assert.equal(registry.bySignature(SIGNATURE).model, first);
	assert.equal(registry.bySignature(SIGNATURE).code, null);
	assert.equal(registry.size, 1);
	assert.deepEqual(registry.list.map(record => record.signature), [SIGNATURE]);
});

function createModel(checksum, code, superType = "Ljava/lang/Object;") {
	const method = Object.freeze({
		classType: CLASS_TYPE,
		descriptor: DESCRIPTOR,
		index: 0,
		name: METHOD_NAME
	});
	assert.equal(methodSignature(method), SIGNATURE);
	const encoded = Object.freeze({
		accessFlags: 0x1,
		code,
		codeOff: code ? checksum : 0,
		index: 0
	});
	const definition = Object.freeze({
		classData: Object.freeze({
			directMethods: Object.freeze([encoded]),
			virtualMethods: Object.freeze([])
		}),
		interfaces: Object.freeze([]),
		superType,
		type: CLASS_TYPE
	});
	return Object.freeze({
		classes: Object.freeze([definition]),
		header: Object.freeze({ checksum }),
		methods: Object.freeze([method])
	});
}

function createCode(identity) {
	return Object.freeze({
		identity,
		instructions: new Uint16Array([0x000e]),
		registersSize: 1
	});
}
