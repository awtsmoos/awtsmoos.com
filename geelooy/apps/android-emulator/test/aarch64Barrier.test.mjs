//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";

const OPTIONS = Object.freeze([
	[1, "oshld", "outer-shareable", "loads"],
	[2, "oshst", "outer-shareable", "stores"],
	[3, "osh", "outer-shareable", "all"],
	[5, "nshld", "non-shareable", "loads"],
	[6, "nshst", "non-shareable", "stores"],
	[7, "nsh", "non-shareable", "all"],
	[9, "ishld", "inner-shareable", "loads"],
	[10, "ishst", "inner-shareable", "stores"],
	[11, "ish", "inner-shareable", "all"],
	[13, "ld", "full-system", "loads"],
	[14, "st", "full-system", "stores"],
	[15, "sy", "full-system", "all"]
]);

test("authentic DMB ISHLD decodes exactly", () => {
	const decoded = decodeAarch64Instruction(0xd50339bf, 4758812n);
	assert.deepEqual(shape(decoded), {
		access: "loads",
		domain: "inner-shareable",
		family: "system-barrier",
		mnemonic: "dmb",
		option: 9,
		optionName: "ishld",
		supported: true
	});
});

test("all named DMB and DSB options decode", () => {
	for (const [option, name, domain, access] of OPTIONS) {
		for (const [base, mnemonic] of [[0xd50330bf, "dmb"], [0xd503309f, "dsb"]]) {
			const decoded = decodeAarch64Instruction(barrierWord(base, option));
			assert.equal(decoded.mnemonic, mnemonic);
			assert.equal(decoded.optionName, name);
			assert.equal(decoded.domain, domain);
			assert.equal(decoded.access, access);
		}
	}
});

test("ISB accepts only SY", () => {
	const isb = decodeAarch64Instruction(0xd5033fdf);
	assert.equal(isb.family, "system-barrier");
	assert.equal(isb.mnemonic, "isb");
	assert.equal(isb.optionName, "sy");
	for (const option of [0, 1, 4, 8, 9, 12]) {
		assert.equal(
			decodeAarch64Instruction(barrierWord(0xd50330df, option)).family,
			"unknown"
		);
	}
});

test("reserved DMB and DSB options remain unknown", () => {
	for (const option of [0, 4, 8, 12]) {
		for (const base of [0xd503309f, 0xd50330bf]) {
			assert.equal(
				decodeAarch64Instruction(barrierWord(base, option)).family,
				"unknown"
			);
		}
	}
});

test("adjacent NOP, BTI, WFE, MRS, and malformed words stay intact", () => {
	assert.equal(decodeAarch64Instruction(0xd503201f).mnemonic, "nop");
	assert.equal(decodeAarch64Instruction(0xd503245f).mnemonic, "bti");
	assert.equal(decodeAarch64Instruction(0xd503205f).mnemonic, "wfe");
	assert.equal(decodeAarch64Instruction(0xd53bd048).systemName, "TPIDR_EL0");
	assert.equal(decodeAarch64Instruction(0xd50339bd).family, "unknown");
});

function barrierWord(base, option) {
	return (base | (option << 8)) >>> 0;
}

function shape(instruction) {
	const keys = ["access", "domain", "family", "mnemonic", "option",
		"optionName", "supported"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
