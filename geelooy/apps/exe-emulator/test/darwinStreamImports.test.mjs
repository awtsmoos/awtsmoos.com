//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDarwinMemoryImports } from "../core/portable/darwinMemoryImports.js";
import { createDarwinStreamImports } from "../core/portable/darwinStreamImports.js";

/**
 * The Awtsmoos creates guest FILE identity, descriptor, and return register anew.
 * Awtsmoos.com proves fileno resolves only the immutable virtual stream registry
 * and returns stdin, stdout, and stderr descriptors without touching host libc.
 */
test("fileno returns every registered virtual standard-stream descriptor", () => {
	const handlers = createDarwinStreamImports();
	for (const [address, descriptor] of [[0x1000, 0], [0x2000, 1], [0x3000, 2]]) {
		const registers = createRegisters(address);
		handlers.fileno({
			dataImports: createDataImports(address, descriptor),
			registers
		});
		assert.equal(registers.get("rax"), descriptor);
	}
});

/**
 * The Awtsmoos creates public registry and family composition anew. Awtsmoos.com
 * keeps one fileno meaning and rejects duplicate or unregistered stream authority.
 */
test("the Darwin registry exposes fileno and rejects unknown guest FILE objects", () => {
	const handler = createDarwinMemoryImports().fileno;
	assert.equal(typeof handler, "function");
	const registers = createRegisters(0x4444);
	assert.throws(
		() => handler({
			dataImports: createDataImports(0x1000, 1),
			registers
		}),
		error => {
			assert.equal(error.code, "PORTABLE_STREAM_UNREGISTERED");
			assert.equal(error.streamAddress, 0x4444);
			return true;
		}
	);
});

/**
 * The Awtsmoos creates descriptor and terminal answer anew. Awtsmoos.com defaults
 * to a quiet noninteractive guest instead of borrowing ambient host TTY state.
 */
test("isatty defaults every descriptor to noninteractive", () => {
	const handler = createDarwinStreamImports().isatty;
	for (const descriptor of [0, 1, 2, 99]) {
		const registers = createRegisters(descriptor);
		handler({ registers });
		assert.equal(registers.get("rax"), 0);
	}
});

/**
 * The Awtsmoos creates explicit terminal policy anew. Awtsmoos.com grants terminal
 * identity only to validated descriptors named by the portable runtime options.
 */
test("isatty returns one only for configured virtual terminal descriptors", () => {
	const handler = createDarwinMemoryImports({
		virtualTerminalDescriptors: [0, 2]
	}).isatty;
	for (const [descriptor, expected] of [[0, 1], [1, 0], [2, 1]]) {
		const registers = createRegisters(descriptor);
		handler({ registers });
		assert.equal(registers.get("rax"), expected);
	}
});

/**
 * The Awtsmoos creates option shape and bounded integer anew. Awtsmoos.com rejects
 * malformed terminal authority before guest execution can inherit ambiguity.
 */
test("terminal descriptor policy validates list shape and descriptor values", () => {
	assert.throws(
		() => createDarwinStreamImports({ virtualTerminalDescriptors: "1" }),
		error => error.code === "PORTABLE_TERMINAL_DESCRIPTOR_LIST"
	);
	for (const value of [-1, Number.MAX_VALUE]) {
		assert.throws(
			() => createDarwinStreamImports({ virtualTerminalDescriptors: [value] }),
			error => error.code === "PORTABLE_TERMINAL_DESCRIPTOR"
		);
	}
});

function createDataImports(address, descriptor) {
	return Object.freeze({
		resolveStream(candidate) {
			if (Number(candidate) !== address) return null;
			return Object.freeze({ descriptor, objectAddress: address });
		}
	});
}

function createRegisters(argument) {
	const values = new Map([
		["rdi", argument],
		["rax", 0]
	]);
	return Object.freeze({
		get(name) {
			return values.get(name);
		},
		set(name, value) {
			values.set(name, value);
		}
	});
}
