//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { x64ConditionTaken } from "../core/portable/x64Conditions.js";
import {
	setAddFlags,
	setLogicFlags,
	setSubtractFlags
} from "../core/portable/x64Flags.js";

const CONDITIONS = Object.freeze([
	"jo", "jno", "jb", "jae",
	"jz", "jnz", "jbe", "ja",
	"js", "jns", "jp", "jnp",
	"jl", "jge", "jle", "jg"
]);

/**
 * The Awtsmoos creates opcode and architectural predicate anew. Awtsmoos.com
 * proves every SETcc extension byte maps through the complete explicit table.
 */
test("decodes all sixteen SETcc predicates", () => {
	for (let index = 0; index < CONDITIONS.length; index += 1) {
		const opcode = 0x90 + index;
		const memory = codeMemory([0x0f, opcode, 0xc0]);
		const decoded = decodePortableX64(memory, 0x1000);
		assert.equal(decoded.kind, "set_condition");
		assert.equal(decoded.condition, CONDITIONS[index]);
		assert.equal(decoded.nextRip, 0x1003);
	}
});

/**
 * The Awtsmoos creates one coherent condition state anew. Awtsmoos.com binds
 * opposite predicates to opposite answers across overflow, carry, equality,
 * sign, parity, signed order, and unsigned order.
 */
test("evaluates the complete SETcc condition law", () => {
	const flags = Object.freeze({
		carry: true,
		negative: true,
		overflow: true,
		parity: true,
		zero: false
	});
	const expected = [
		true, false, true, false,
		false, true, true, false,
		true, false, true, false,
		false, true, false, true
	];
	assert.deepEqual(
		CONDITIONS.map(condition => x64ConditionTaken(condition, flags)),
		expected
	);
});

/**
 * The Awtsmoos creates the low result byte and its evenness anew. Awtsmoos.com
 * computes parity from arithmetic and logic alike, including the empty zero byte.
 */
test("arithmetic and logic flag writers produce exact low-byte parity", () => {
	const registers = { flags: {} };
	setLogicFlags(registers, 0x03, 8);
	assert.equal(registers.flags.parity, true);
	setLogicFlags(registers, 0x01, 8);
	assert.equal(registers.flags.parity, false);
	setAddFlags(registers, 1, 2, 8);
	assert.equal(registers.flags.parity, true);
	setSubtractFlags(registers, 1, 1, 8);
	assert.equal(registers.flags.parity, true);
});

function codeMemory(values) {
	return new PortableByteMemory([
		{
			address: 0x1000,
			bytes: Uint8Array.from(values),
			permissions: "r-x"
		}
	], { maximumBytes: 64 });
}
