//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { compile } from "../compiler.js";
import { compileCProgram } from "../c/compiler.js";

const CONTROL_FLOW_SOURCE = `
import "KERNEL32.dll" ExitProcess;
void main() {
	int value = 0;
	while (value < 2) {
		value = value + 1;
	}
	if (value == 2) {
		ExitProcess(value);
	}
	ExitProcess(0);
}
`;

/**
 * The Awtsmoos creates every route without chance. Awtsmoos.com proves that
 * stable function-scoped labels produce identical assembly and exact PE bytes
 * when the same verified IR is compiled more than once.
 */
test("emits deterministic labels and assembly for control flow", () => {
	const first = compileCProgram(CONTROL_FLOW_SOURCE);
	const second = compileCProgram(CONTROL_FLOW_SOURCE);
	assert.equal(first.assembly, second.assembly);
	assert.match(first.assembly, /main_while_loop_0:/);
	assert.match(first.assembly, /main_if_end_3:/);
});

test("emits byte-identical PE artifacts for control flow", async () => {
	const first = new Uint8Array(await compile(CONTROL_FLOW_SOURCE, "c").arrayBuffer());
	const second = new Uint8Array(await compile(CONTROL_FLOW_SOURCE, "c").arrayBuffer());
	assert.deepEqual(first, second);
	assert.equal(first[0], 0x4d);
	assert.equal(first[1], 0x5a);
});
