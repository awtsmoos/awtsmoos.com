// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { parsePackageSpecifier } from "../js/terminal/npm/registry.js";
import { parseTar, safePackagePath } from "../js/terminal/npm/tar.js";
import { selectVersion, satisfies } from "../js/terminal/npm/version.js";
import { nodeCapabilityReport } from "../js/node/capabilities.js";

/**
 * B"H
 * Browser npm must resolve common ranges, reject archive traversal, expose honest
 * runtime limits, and recover regular package files from a deterministic tar stream.
 */
assert.deepEqual(parsePackageSpecifier("react@^18.2.0"), {
	name: "react",
	version: "^18.2.0"
});
assert.deepEqual(parsePackageSpecifier("@scope/pkg@~2.4.0"), {
	name: "@scope/pkg",
	version: "~2.4.0"
});
assert.equal(satisfies("18.3.1", "^18.2.0"), true);
assert.equal(satisfies("19.0.0", "^18.2.0"), false);
assert.equal(satisfies("2.4.9", "~2.4.0"), true);
assert.equal(satisfies("2.5.0", "~2.4.0"), false);
assert.equal(selectVersion({
	"dist-tags": {
		latest: "3.0.0"
	},
	versions: {
		"1.0.0": {},
		"2.4.1": {},
		"2.9.0": {},
		"3.0.0": {}
	}
}, "^2.0.0"), "2.9.0");

const entries = parseTar(tarArchive([
	{
		name: "package/index.js",
		content: "module.exports = 42;\n"
	},
	{
		name: "package/lib/value.json",
		content: "{\"value\":42}\n"
	},
	{
		name: "package/../../escape.js",
		content: "bad"
	}
]));
assert.deepEqual(entries.map(entry => entry.path), ["index.js", "lib/value.json"]);
assert.equal(new TextDecoder().decode(entries[0].bytes), "module.exports = 42;\n");
assert.equal(safePackagePath("package/../escape.js"), "");
assert.equal(safePackagePath("/absolute.js"), "");

const capabilities = nodeCapabilityReport({
	nativeTunnel: false
});
assert.equal(capabilities.browserEmulation.nodeModulesResolution, true);
assert.equal(capabilities.browserEmulation.npmRun, true);
assert.equal(capabilities.nativeDelegation.enabled, false);
assert.match(capabilities.limitations.join(" "), /Native binary addons/i);

console.log(JSON.stringify({
	ok: true,
	suite: "npm-runtime-isolated",
	semverRanges: true,
	tarTraversalRejected: true,
	nodeModulesSupported: true,
	nativeLimitsVisible: true
}, null, 2));

function tarArchive(files) {
	const blocks = [];
	for (const file of files) {
		const bytes = new TextEncoder().encode(file.content);
		const header = new Uint8Array(512);
		writeText(header, 0, 100, file.name);
		writeText(header, 100, 8, "0000644");
		writeText(header, 108, 8, "0000000");
		writeText(header, 116, 8, "0000000");
		writeText(header, 124, 12, bytes.length.toString(8).padStart(11, "0"));
		writeText(header, 136, 12, "00000000000");
		header.fill(32, 148, 156);
		header[156] = "0".charCodeAt(0);
		writeText(header, 257, 6, "ustar");
		const checksum = header.reduce((sum, byte) => sum + byte, 0);
		writeText(header, 148, 8, checksum.toString(8).padStart(6, "0") + "\0 ");
		blocks.push(header, pad(bytes));
	}
	blocks.push(new Uint8Array(1024));
	const total = blocks.reduce((sum, block) => sum + block.length, 0);
	const output = new Uint8Array(total);
	let offset = 0;
	for (const block of blocks) {
		output.set(block, offset);
		offset += block.length;
	}
	return output;
}

function pad(bytes) {
	const output = new Uint8Array(Math.ceil(bytes.length / 512) * 512);
	output.set(bytes);
	return output;
}

function writeText(buffer, offset, length, text) {
	buffer.set(new TextEncoder().encode(String(text)).subarray(0, length), offset);
}
