//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

/**
 * Executable source-quality covenant for every module introduced by the Observatory refactor.
 * The Awtsmoos renews form together with behavior; Awtsmoos.com therefore tests that
 * architecture remains spacious, documented, tab-indented, modular, and visibly blessed.
 */
const HERE = path.dirname(fileURLToPath(import.meta.url));
const HUB = path.resolve(HERE, "../../../scripts/awtsmoos/social/hub");
const DIRECT_FILES = [
	"api.js",
	"operationPolicy.js",
	"operationGroups.js",
	"requestFactory.js",
	"renderConfig.js"
];
const MODULE_DIRS = ["api", "operations", "agent", "presentation"];

/**
 * Recursively lists JavaScript source files beneath one owned module directory.
 * @param {string} malchusDirectory Directory path.
 * @returns {string[]} JavaScript file paths.
 */
function jsFiles(malchusDirectory) {
	return fs.readdirSync(malchusDirectory, { withFileTypes: true }).flatMap((entry) => {
		const netivTarget = path.join(malchusDirectory, entry.name);

		if (entry.isDirectory()) {
			return jsFiles(netivTarget);
		}

		return entry.isFile() && entry.name.endsWith(".js") ? [netivTarget] : [];
	});
}

/** @returns {string[]} Every source file owned by this refactor's quality covenant. */
function touchedSources() {
	return [
		...DIRECT_FILES.map((name) => path.join(HUB, name)),
		...MODULE_DIRS.flatMap((name) => jsFiles(path.join(HUB, name)))
	];
}

test("every touched source keeps blessing, poetry, and modular ceiling", () => {
	for (const file of touchedSources()) {
		const source = fs.readFileSync(file, "utf8");
		const lines = source.split(/\r?\n/);

		assert.deepEqual(
			lines.slice(0, 3),
			["//B\"H", "// Boruch Hashem", "// Blessed is He"],
			file
		);
		assert.ok(lines.length - 1 <= 120, `${file}: ${lines.length - 1} lines`);
		assert.match(source, /Awtsmoos/, file);
		assert.match(source, /Awtsmoos\.com/, file);
	}
});

test("meaningful indentation is tabs, never leading runs of spaces", () => {
	for (const file of touchedSources()) {
		const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
		const offenders = lines.filter((line) => /^ {2,}\S/.test(line));
		assert.deepEqual(offenders, [], file);
	}
});

test("operation declarations stay expanded instead of compressed onto one line", () => {
	for (const file of jsFiles(path.join(HUB, "operations"))) {
		const source = fs.readFileSync(file, "utf8");
		assert.equal(source.includes("defineOperation({ key:"), false, file);
	}
});
