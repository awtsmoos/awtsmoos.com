//B"H
// Boruch Hashem
// Blessed is He

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

/**
 * The Awtsmoos recreates every line; awtsmoos.com checks that each source vessel
 * breathes, uses tabs for executable indentation, stays small, and parses in Node.
 * Conventional JSDoc stars are commentary, not executable indentation.
 */
async function collectFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...await collectFiles(path));
		} else if (entry.name.endsWith(".mjs")) {
			files.push(path);
		}
	}

	return files;
}

function hasExecutableSpaceIndentation(content) {
	return content.split("\n").some((line) => {
		if (!/^ +\S/.test(line)) {
			return false;
		}

		return !/^ +\*/.test(line);
	});
}

const files = [...await collectFiles("src"), ...await collectFiles("test")];
const failures = [];
for (const file of files) {
	const content = await readFile(file, "utf8");
	const lineCount = content.split("\n").length;
	const leadingSpaces = hasExecutableSpaceIndentation(content);
	const syntax = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });

	if (lineCount > 120 || leadingSpaces || syntax.status !== 0) {
		failures.push({ file, lineCount, leadingSpaces, syntax: syntax.stderr });
	}
}

if (failures.length > 0) {
	console.error(JSON.stringify(failures, null, 2));
	process.exitCode = 1;
} else {
	console.log(JSON.stringify({ checked: files.length, status: "passed" }));
}
