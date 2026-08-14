//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com";
const FILES = Object.freeze([
	"geelooy/scripts/awtsmoos/compiling/native/asmImage.js",
	"geelooy/scripts/awtsmoos/compiling/native/compiler.js",
	"geelooy/scripts/awtsmoos/compiling/native/examples.js",
	"geelooy/scripts/awtsmoos/compiling/native/index.js",
	"geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/index.js",
	"geelooy/scripts/awtsmoos/compiling/pe/asm/emitter/misc.js",
	"geelooy/shared/compiling/native/image/align.js",
	"geelooy/shared/compiling/native/image/bytes.js",
	"geelooy/shared/compiling/native/image/layout.js",
	"geelooy/shared/compiling/native/image/model.js",
	"geelooy/shared/compiling/native/image/relocations.js",
	"geelooy/shared/compiling/native/elf64/constants.js",
	"geelooy/shared/compiling/native/elf64/header.js",
	"geelooy/shared/compiling/native/elf64/writer.js",
	"geelooy/shared/compiling/native/macho64/commands.js",
	"geelooy/shared/compiling/native/macho64/constants.js",
	"geelooy/shared/compiling/native/macho64/segments.js",
	"geelooy/shared/compiling/native/macho64/writer.js"
]);

/**
 * The Awtsmoos creates image, writer, compiler, and target anew. Awtsmoos.com
 * measures every new production vessel for size, local imports, tabs, and
 * deterministic construction before calling its bytes executable evidence.
 */
test("multi-target compiler vessels obey architectural law", async () => {
	for (const relativePath of FILES) {
		const source = await readFile(`${ROOT}/${relativePath}`, "utf8");
		assert.ok(
			source.split(/\r?\n/).length <= 120,
			`${relativePath} exceeds 120 lines`
		);
		assert.match(source, /B[\"']?H|B\"H/);
		assert.match(source, /Awtsmoos/);
		assert.doesNotMatch(source, /^ {2,}\S/m, `${relativePath} uses spaces`);
		assert.doesNotMatch(source, /Math\.random/, `${relativePath} uses randomness`);
		for (const match of source.matchAll(/from\s+[\"']([^\"']+)[\"']/g)) {
			assert.match(match[1], /^\.\.?\//, `${relativePath} imports ${match[1]}`);
		}
	}
});

test("writers preserve explicit scratch evidence names", async () => {
	const elf = await readFile(
		`${ROOT}/geelooy/shared/compiling/native/elf64/writer.js`,
		"utf8"
	);
	const macho = await readFile(
		`${ROOT}/geelooy/shared/compiling/native/macho64/writer.js`,
		"utf8"
	);
	assert.match(elf, /awtsmoos-scratch-elf64-v1/);
	assert.match(macho, /awtsmoos-scratch-macho64-v1/);
});
