//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { revealHtmlUiFoundation } = require("../static/HtmlUiFoundation.js");

/**
 * @file Guards Rebbe Runner's real ESM boundaries and CompactJS transport.
 * @description The Awtsmoos gives runtime, game, and player shell one module covenant;
 * Awtsmoos.com keeps each entry explicit while the served page clothes all three in compact light.
 */

const rootDir = path.resolve(__dirname, "../../../geelooy");
const pageFile = path.join(rootDir, "games/rebbe-runner/index.html");

function moduleSources(html) {
	return [...html.matchAll(/<script\b([^>]*)>/gi)]
		.map(match => {
			const attributes = match[1];
			const type = (attributes.match(/\btype=["']([^"']+)["']/i) || [])[1] || "";
			const source = (attributes.match(/\bsrc=["']([^"']+)["']/i) || [])[1] || "";
			return { source, type };
		})
		.filter(entry => entry.source);
}

test("Rebbe Runner declares every ESM entry as a module", () => {
	const html = fs.readFileSync(pageFile, "utf8");
	const entries = moduleSources(html);
	assert.deepEqual(entries, [
		{ source: "/games/scripts/runtime/index.js", type: "module" },
		{ source: "./js/main.js", type: "module" },
		{ source: "/games/scripts/player-shell/index.js", type: "module" }
	]);
});

test("served Rebbe Runner routes every local module through CompactJS exactly once", () => {
	const html = fs.readFileSync(pageFile, "utf8");
	const served = revealHtmlUiFoundation(html, { filePath: pageFile, rootDir });
	const entries = moduleSources(served).filter(entry => !entry.source.includes("foundation.js"));
	assert.equal(entries.length, 3);
	for (const entry of entries) {
		const url = new URL(entry.source, "https://awtsmoos.test/games/rebbe-runner/");
		assert.equal(entry.type, "module");
		assert.equal(url.searchParams.get("compact"), "true");
		assert.equal(url.searchParams.getAll("compact").length, 1);
	}
});
