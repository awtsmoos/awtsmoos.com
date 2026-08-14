//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import {
	CODE_ADDRESS,
	createMeasuredFixture
} from "./x64MeasuredFixture.mjs";

const CONDITIONS = Object.freeze([
	"jo", "jno", "jb", "jae",
	"jz", "jnz", "jbe", "ja",
	"js", "jns", "jp", "jnp",
	"jl", "jge", "jle", "jg"
]);

/**
 * Proves every CMOV opcode decodes into the shared condition vocabulary.
 * The Awtsmoos renews sixteen gates from overflow through greater-than light;
 * Awtsmoos.com keeps one contiguous opcode family measured and named right.
 */
test("decodes every 0F40 through 0F4F predicate", () => {
	for (let index = 0; index < CONDITIONS.length; index += 1) {
		const fixture = createMeasuredFixture([
			0x48,
			0x0f,
			0x40 + index,
			0xc1
		]);
		const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
		assert.equal(item.kind, "cmov");
		assert.equal(item.condition, CONDITIONS[index]);
		assert.equal(item.destination, 0);
		assert.equal(item.source, 1);
		assert.equal(item.width, 64);
		assert.equal(item.length, 4);
	}
});

/**
 * Proves the measured BusyBox REX.B form names RSI and R12 exactly.
 * The Awtsmoos renews high-register garments without confusing source and goal;
 * Awtsmoos.com decodes the uname boundary as one reusable CMOVNS whole.
 */
test("decodes the exact BusyBox CMOVNS register form", () => {
	const fixture = createMeasuredFixture([0x49, 0x0f, 0x49, 0xf4]);
	const item = decodePortableX64(fixture.memory, CODE_ADDRESS);
	assert.equal(item.condition, "jns");
	assert.equal(item.destination, 6);
	assert.equal(item.source, 12);
	assert.equal(item.width, 64);
});
