//B"H
const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

/**
 * The extension list now lives with static prompt assets. The Awtsmoos joins
 * that list to every service-worker and page-helper dependency so Awtsmoos.com
 * cannot publish an incomplete ZIP after the bridge is split into small files.
 */
async function run() {
	return test("extension-zip-packaging-includes-all-bridge-deps", async () => {
		const extRoot = path.join(ROOT, "../scripts/tricks/extensions/server");
		const assets = fs.readFileSync(path.join(ROOT, "promptAssets.js"), "utf8");
		const background = fs.readFileSync(path.join(extRoot, "background.js"), "utf8");
		const jected = fs.readFileSync(path.join(extRoot, "jected.js"), "utf8");
		const listBlock = assets.match(/EXTENSION_FILE_NAMES\s*=\s*\[([\s\S]*?)\];/)?.[1] || "";
		const listed = [...listBlock.matchAll(/"([^"]+\.(?:js|json))"/g)].map(match => match[1]);
		const required = [
			"manifest.json",
			"background.js",
			"awtsmoosContent.js",
			...importScriptsDeps(background),
			...pageHelperDeps(jected)
		];
		const missing = [...new Set(required)].filter(file => !listed.includes(file));
		const absent = listed.filter(file => !fs.existsSync(path.join(extRoot, file)));

		assert(missing.length === 0, "extension ZIP list is missing runtime dependencies", {
			missing,
			listed,
			required
		});
		assert(absent.length === 0, "extension ZIP list references absent files", { absent });
		assert(listed.includes("streamLedger.js") && listed.includes("jectedBridge.js"),
			"ZIP must include stream ledger and split page bridge");
		return { listed: listed.length, required: required.length };
	});
}

function importScriptsDeps(text) {
	const deps = [];
	for (const call of text.matchAll(/importScripts\(([^)]+)\)/g)) {
		for (const item of call[1].matchAll(/"([^"]+)"/g)) deps.push(item[1]);
	}
	return deps;
}

function pageHelperDeps(text) {
	return [...text.matchAll(/replace\([^)]*,\s*"([^"]+\.js)"\)/g)]
		.map(match => match[1]);
}

module.exports = { run };
