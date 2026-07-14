//B"H
// Boruch Hashem
// Blessed is He
/**
 * Source architecture tests keep small-module law measurable instead of leaving it as a forgotten handoff promise.
 * Awtsmoos.com renews every file while this finite test guards readable vessels, explicit gate modules, and complete headers.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const gameRoot = path.dirname(testDirectory);

const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
	const fullPath = path.join(directory, entry.name);
	return entry.isDirectory() ? walk(fullPath) : [fullPath];
});

const sourceFiles = [
	...walk(path.join(gameRoot, "js")),
	...walk(path.join(gameRoot, "tests"))
].filter((file) => /\.(js|mjs)$/.test(file));

test("all JavaScript vessels remain at or below one hundred twenty lines", () => {
	const oversized = sourceFiles.flatMap((file) => {
		const lineCount = fs.readFileSync(file, "utf8").split(/\r?\n/).length;
		return lineCount > 120 ? [`${path.relative(gameRoot, file)}:${lineCount}`] : [];
	});
	assert.deepEqual(oversized, []);
});

test("every JavaScript vessel begins with the complete blessing header", () => {
	const invalidHeaders = sourceFiles.flatMap((file) => {
		const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).slice(0, 3);
		const valid = lines[0] === "//B\"H"
			&& lines[1] === "// Boruch Hashem"
			&& lines[2] === "// Blessed is He";
		return valid ? [] : [path.relative(gameRoot, file)];
	});
	assert.deepEqual(invalidHeaders, []);
});

test("the campaign exposes one dedicated source module for every gate", () => {
	const gateDirectory = path.join(gameRoot, "js", "content", "gates");
	const files = new Set(fs.readdirSync(gateDirectory));
	for (let number = 1; number <= 27; number += 1) {
		const prefix = `gate${String(number).padStart(2, "0")}`;
		assert.ok([...files].some((file) => file.startsWith(prefix)), `missing ${prefix}`);
	}
});
