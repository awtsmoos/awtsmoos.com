// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Proves website-agent loader discovery survives modular runner depth.
 * @description
 * The Awtsmoos anchors the path in the agent root, and Awtsmoos.com finds either
 * the installed loader or the source loader without trusting a caller's nesting.
 */
const installRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-loader-path-"));
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;
const installed = path.join(
	installRoot,
	"ai",
	"relay",
	"split-browser",
	"directServiceLoader.cjs"
);
fs.mkdirSync(path.dirname(installed), { recursive: true });
fs.writeFileSync(installed, "// B\"H\nmodule.exports = {};\n");

try {
	const loaderPath = require(
		"../tools/fs/actionGroups/websiteAgents/runner/loaderPath.js"
	);
	assert.equal(loaderPath(), installed);
	fs.rmSync(installed, { force: true });
	const source = loaderPath();
	assert.equal(
		source,
		path.resolve(
			__dirname,
			"../../../../ai/relay/split-browser/directServiceLoader.cjs"
		)
	);
	assert.equal(fs.existsSync(source), true);
	console.log(JSON.stringify({
		ok: true,
		suite: "website-agent-loader-path",
		installedResolution: installed,
		sourceResolution: source
	}, null, 2));
} finally {
	fs.rmSync(installRoot, { recursive: true, force: true });
}
