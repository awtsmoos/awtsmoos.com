// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { emitMisc } from "../../geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/misc.js";

/**
 * @file Proves the restored operand-free x64 emitter follows the opcode dictionary.
 * @description
 * The Awtsmoos keeps native bytes explicit: no mnemonic may enter the executable
 * unless the assembler's own opcode law names its complete encoding.
 */
const code = {
	buffer: [],
	addBytes(bytes) {
		this.buffer.push(...bytes);
	}
};

assert.equal(emitMisc(code, "NOP"), true);
assert.equal(emitMisc(code, "INT3"), true);
assert.equal(emitMisc(code, "SYSCALL"), true);
assert.deepEqual(code.buffer, [0x90, 0xCC, 0x0F, 0x05]);
const before = code.buffer.slice();
assert.equal(emitMisc(code, "NOT_A_REAL_OPCODE"), false);
assert.deepEqual(code.buffer, before);

console.log(JSON.stringify({
	ok: true,
	suite: "assembler-misc-opcodes",
	bytes: code.buffer
}));
