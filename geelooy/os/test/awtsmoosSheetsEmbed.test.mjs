//B"H
//Boruch Hashem
//Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAwtsmoosSheetsEmbedConfiguration } from "../programs/awtsmoos-sheets/embedConfiguration.js";

/**
 * @file Witnesses the trusted same-origin Awtsmoos Sheets embed covenant.
 * @description
 * The Awtsmoos joins Sheets and Geelooy OS without pretending first-party code is
 * isolated by a sandbox it can escape. Awtsmoos.com keeps trust explicit and still
 * guards depth, protocol, origin, and clipboard capability.
 */
const osRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("same-origin Sheets embed is trusted without a self-defeating sandbox", () => {
	const configuration = createAwtsmoosSheetsEmbedConfiguration({
		locationObject: {
			href: "https://awtsmoos.com/os/?embedDepth=0",
			search: "?embedDepth=0"
		}
	});

	assert.equal(configuration.ok, true);
	assert.equal(configuration.sandbox, "");
	assert.equal(configuration.targetOrigin, "https://awtsmoos.com");
	assert.match(configuration.allow, /clipboard-read/);
	assert.match(configuration.allow, /clipboard-write/);
	const url = new URL(configuration.url);
	assert.equal(url.searchParams.get("embed"), "awtsmoos-os");
	assert.equal(url.searchParams.get("embedParent"), "geelooy-os");
});

test("Sheets host only writes sandbox when a restrictive policy exists", () => {
	const hostSource = fs.readFileSync(
		path.join(osRoot, "programs/awtsmoos-sheets/index.js"),
		"utf8"
	);
	assert.match(hostSource, /if \(configuration\.sandbox\)/);
	assert.doesNotMatch(hostSource, /allow-scripts allow-same-origin/);
});
