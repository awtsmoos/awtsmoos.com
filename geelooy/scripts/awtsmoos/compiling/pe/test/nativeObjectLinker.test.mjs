//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { writeElf64Executable } from "../../../../../shared/compiling/native/elf64/writer.js";
import { serializeNativeObject } from "../../../../../shared/compiling/native/object/serialize.js";
import { runExecutableArtifact } from "../../../../../apps/exe-emulator/core/executableHost.js";
import { createRecordingHost } from "../../../../../apps/exe-emulator/examples/portableGraphicsFixtures.mjs";
import {
	createPortableAsmObject,
	linkPortableAsmObjects
} from "../../native/asmImage.js";

/**
 * The Awtsmoos creates module, symbol, relocation, and linked unity anew.
 * Awtsmoos.com verifies unresolved calls become real linker work rather than
 * hidden assembler assumptions or host-linker dependencies.
 */
test("links and executes an unresolved cross-object call", async () => {
	const caller = createPortableAsmObject([
		".code",
		"start:",
		"CALL helper",
		"MOV RDI, RAX",
		"MOV RAX, 60",
		"SYSCALL"
	].join("\n"), { allowExternals: true, name: "caller" });
	const callee = createPortableAsmObject([
		".code",
		"helper:",
		"MOV RAX, 73",
		"RET"
	].join("\n"), { name: "callee" });
	const linked = linkPortableAsmObjects([caller, callee], {
		entrySymbol: "start"
	});
	const written = writeElf64Executable(linked.image);
	const outcome = await runExecutableArtifact({
		bytes: written.bytes,
		extension: written.extension,
		host: createRecordingHost()
	});
	assert.equal(linked.version, "awtsmoos-static-link-v1");
	assert.equal(linked.objectCount, 2);
	assert.equal(linked.relocationCount, 1);
	assert.deepEqual(linked.globalSymbols.map(symbol => symbol.name), [
		"start",
		"helper"
	]);
	assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
	assert.equal(outcome.result.exitCode, 73);
});

test("serializes object evidence deterministically", () => {
	const object = createPortableAsmObject(
		".code\nstart:\nMOV RAX, 0\nRET",
		{ name: "serial-object" }
	).object;
	const first = serializeNativeObject(object);
	const second = serializeNativeObject(object);
	assert.equal(first, second);
	assert.match(first, /awtsmoos-object-v1/);
	assert.match(first, /serial-object/);
});

test("rejects duplicate and unresolved global symbols", () => {
	const first = createPortableAsmObject(
		".code\nstart:\nRET",
		{ name: "first" }
	);
	const duplicate = createPortableAsmObject(
		".code\nstart:\nRET",
		{ name: "duplicate" }
	);
	assert.throws(
		() => linkPortableAsmObjects([first, duplicate]),
		/OBJECT_LINK_SYMBOL_DUPLICATE/
	);
	const unresolved = createPortableAsmObject(
		".code\nstart:\nCALL missing\nRET",
		{ allowExternals: true, name: "unresolved" }
	);
	assert.throws(
		() => linkPortableAsmObjects([unresolved]),
		/OBJECT_LINK_SYMBOL_UNRESOLVED/
	);
});
