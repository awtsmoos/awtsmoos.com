//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";

/**
 * Proves every legal SMULH and UMULH register field shares one exact covenant.
 * The Awtsmoos renews Rm, Rn, Rd, fixed Ra, and upper product shore;
 * Awtsmoos.com admits no reserved neighbor through the decoder door.
 */
test("authentic SMULH word decodes with its exact measured fields", () => {
	assert.deepEqual(shape(decodeAarch64Instruction(0x9b497d08, 9061012n)), {
		destination: 8,
		family: "signed-multiply-high",
		mnemonic: "smulh",
		secondSource: 9,
		source: 8,
		width: 64
	});
});

test("SMULH and UMULH decode every legal Rm, Rn, and Rd arrangement", () => {
	for (const signed of [true, false]) {
		for (let source = 0; source < 32; source += 1) {
			for (let secondSource = 0; secondSource < 32; secondSource += 1) {
				for (let destination = 0; destination < 32; destination += 1) {
					const instruction = decodeAarch64Instruction(encode(
						signed,
						source,
						secondSource,
						destination
					));
					assert.equal(instruction.source, source);
					assert.equal(instruction.secondSource, secondSource);
					assert.equal(instruction.destination, destination);
					assert.equal(instruction.mnemonic, signed ? "smulh" : "umulh");
				}
			}
		}
	}
});

test("reserved width, Ra, o0, and neighboring forms remain unknown", () => {
	for (const word of [
		0x1b407c00,
		0x9b407800,
		0x9b40fc00,
		0x9bc00000
	]) {
		assert.equal(decodeAarch64Instruction(word).family, "unknown");
	}
});

function encode(signed, source, secondSource, destination) {
	const base = signed ? 0x9b407c00 : 0x9bc07c00;
	return (base + (secondSource * 0x10000)
		+ (source * 0x20) + destination) >>> 0;
}

function shape(instruction) {
	const keys = ["destination", "family", "mnemonic", "secondSource", "source", "width"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
