//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";

const CASES = Object.freeze([
	[0xd50320ff, 7, "xpaclri", "strip", "none", "none", "x30"],
	[0xd503211f, 8, "pacia1716", "sign", "a", "x16", "x17"],
	[0xd503215f, 10, "pacib1716", "sign", "b", "x16", "x17"],
	[0xd503219f, 12, "autia1716", "authenticate", "a", "x16", "x17"],
	[0xd50321df, 14, "autib1716", "authenticate", "b", "x16", "x17"],
	[0xd503231f, 24, "paciaz", "sign", "a", "zero", "x30"],
	[0xd503233f, 25, "paciasp", "sign", "a", "sp", "x30"],
	[0xd503235f, 26, "pacibz", "sign", "b", "zero", "x30"],
	[0xd503237f, 27, "pacibsp", "sign", "b", "sp", "x30"],
	[0xd503239f, 28, "autiaz", "authenticate", "a", "zero", "x30"],
	[0xd50323bf, 29, "autiasp", "authenticate", "a", "sp", "x30"],
	[0xd50323df, 30, "autibz", "authenticate", "b", "zero", "x30"],
	[0xd50323ff, 31, "autibsp", "authenticate", "b", "sp", "x30"]
]);

test("authentic PACIASP decodes with exact compatibility metadata", () => {
	const decoded = decodeAarch64Instruction(0xd503233f, 4706164n);
	assert.deepEqual(shape(decoded), {
		family: "system-hint",
		immediate: 25,
		key: "a",
		mnemonic: "paciasp",
		modifier: "sp",
		operation: "sign",
		pointerAuthentication: true,
		supported: true,
		target: "x30"
	});
});

test("all toolchain-proven PAC, AUT, and XPAC hints decode", () => {
	for (const [word, immediate, mnemonic, operation, key, modifier, target] of CASES) {
		const decoded = decodeAarch64Instruction(word);
		assert.equal(decoded.family, "system-hint");
		assert.equal(decoded.immediate, immediate);
		assert.equal(decoded.mnemonic, mnemonic);
		assert.equal(decoded.operation, operation);
		assert.equal(decoded.key, key);
		assert.equal(decoded.modifier, modifier);
		assert.equal(decoded.target, target);
		assert.equal(decoded.pointerAuthentication, true);
		assert.equal(decoded.supported, true);
	}
});

test("adjacent NOP, BTI, WFE, generic hints, and malformed words remain exact", () => {
	assert.equal(decodeAarch64Instruction(0xd503201f).mnemonic, "nop");
	assert.equal(decodeAarch64Instruction(0xd503245f).mnemonic, "bti");
	assert.equal(decodeAarch64Instruction(0xd503205f).mnemonic, "wfe");
	assert.equal(decodeAarch64Instruction(hintWord(6)).mnemonic, "hint");
	assert.equal(decodeAarch64Instruction(hintWord(6)).supported, false);
	assert.equal(decodeAarch64Instruction(0xd503233d).family, "unknown");
});

function hintWord(immediate) {
	return (0xd503201f + immediate * 0x20) >>> 0;
}

function shape(instruction) {
	const keys = ["family", "immediate", "key", "mnemonic", "modifier",
		"operation", "pointerAuthentication", "supported", "target"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
