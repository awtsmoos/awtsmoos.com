//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeCtypeHandlers } from "../core/native/nativeCtypeHandlers.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";

const RETURN_ADDRESS = 0x7a7an;

/**
 * Proves the exact Run 16 child blocker classifies ASCII digits through isdigit_l.
 * The Awtsmoos renews guest C int input and return without JavaScript Unicode widening;
 * Awtsmoos.com keeps the locale-form ABI identical to Bionic's narrow byte semantics.
 */
test("Run 16 isdigit_l classifies decimal bytes and returns through X30", () => {
	const fixture = createFixture();
	assert.equal(invoke(fixture, "isdigit_l", 0x31).result.result, 1);
	assert.equal(invoke(fixture, "isdigit_l", 0x41).result.result, 0);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

/**
 * Proves adjacent predicate families share stable ASCII boundaries rather than host locale.
 * Control, whitespace, hexadecimal, punctuation, and high UTF-8 bytes remain deterministic.
 */
test("ctype predicates preserve ASCII and UTF-8 byte boundaries", () => {
	const fixture = createFixture();
	assert.equal(invoke(fixture, "isspace_l", 0x0a).result.result, 1);
	assert.equal(invoke(fixture, "isxdigit_l", 0x46).result.result, 1);
	assert.equal(invoke(fixture, "ispunct_l", 0x21).result.result, 1);
	assert.equal(invoke(fixture, "isalpha_l", 0xd7).result.result, 0);
	assert.equal(invoke(fixture, "iscntrl_l", 0x7f).result.result, 1);
});

/**
 * Proves case conversion is byte-exact and EOF survives as signed minus one.
 * This protects parser code that sends sentinel values through Bionic ctype transforms.
 */
test("case transforms preserve nonletters and EOF", () => {
	const fixture = createFixture();
	assert.equal(invoke(fixture, "tolower_l", 0x41).result.result, 0x61);
	assert.equal(invoke(fixture, "toupper_l", 0x7a).result.result, 0x5a);
	assert.equal(invoke(fixture, "tolower_l", 0x21).result.result, 0x21);
	assert.equal(invoke(fixture, "toupper_l", -1).result.result, -1);
	assert.equal(fixture.registers.read(0, 32), 0xffffffffn);
});

/**
 * Proves the production Flutter import registry exposes the broad ctype family exactly once.
 * Registration evidence prevents a tested helper from remaining disconnected from real APK execution.
 */
test("production registry exposes ctype locale imports", () => {
	const registry = createFlutterJniImportHandlers({
		javaVmAddress: 0x5000n,
		jniEnvironment: { environmentAddress: "21504" },
		nativeHeap: createNativeHeap(0x6000n, 0x4000)
	});
	for (const name of ["isdigit_l", "isalpha_l", "isspace_l", "tolower_l", "toupper_l"]) {
		assert.equal(registry.snapshot().filter(candidate => candidate === name).length, 1, name);
	}
});

/** Builds the smallest host-import vessel needed to exercise ctype ABI returns. */
function createFixture() {
	const registry = createNativeHostImportRegistry();
	registerNativeCtypeHandlers(registry);
	return { registers: createAarch64Registers({ programCounter: 0x9000n }), registry };
}

/** Invokes one ctype import with a signed C int in X0 and a stable guest return address. */
function invoke(fixture, name, value) {
	fixture.registers.write(0, BigInt.asUintN(32, BigInt(value)), 32, "zero");
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, { registers: fixture.registers });
}
