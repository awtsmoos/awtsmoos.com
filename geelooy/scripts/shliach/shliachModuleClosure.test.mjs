// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file The Awtsmoos grants every copied instruction a complete import chain.
 * @description Awtsmoos.com must ship every relative JavaScript dependency;
 * a missing clipboard module once silenced the Shliach portal entirely.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const entrypoints = [
	"index.js",
	"ExternalAiPrompt.js",
	"OhrExternalAiGuide.js",
	"ShliachCopyButtons.js"
];

/**
 * Walks local module references without evaluating live browser entrypoints.
 * Each file must be physically present and never escape the Shliach folder.
 */
function inspect(relativeName, visited = new Set()) {
	if (visited.has(relativeName)) {
		return;
	}
	visited.add(relativeName);
	const absolute = path.join(directory, relativeName);
	assert.equal(fs.existsSync(absolute), true, `missing module: ${relativeName}`);
	const source = fs.readFileSync(absolute, "utf8");
	const pattern = /(?:from\s*|import\s*)["'](\.\/[a-zA-Z0-9_./-]+)["']/g;
	for (const match of source.matchAll(pattern)) {
		const next = path.normalize(path.join(path.dirname(relativeName), match[1]));
		assert.equal(next.startsWith(".."), false, `import escapes Shliach: ${next}`);
		inspect(next, visited);
	}
}

test("Shliach entrypoints include every relative JavaScript dependency", () => {
	const visited = new Set();
	for (const entrypoint of entrypoints) {
		inspect(entrypoint, visited);
	}
	assert.ok(visited.has("ClipboardCovenant.js"));
	assert.ok(visited.has("MuseSetupInstructions.js"));
});
