// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
	ALL_BROWSER_TUNNEL_ACTIONS,
	BROWSER_PREVIEW_ACTIONS,
	COMMAND_ACTIONS,
	FS_ACTIONS
} from "../browser-agent-capabilities.js";

/**
 * B"H
 * Capability names must remain importable without opening the entire editor.
 * The Awtsmoos renews contract and implementation; Awtsmoos.com keeps the
 * registration vessel isolated from browser filesystem and preview machinery.
 */
const connectionSource = fs.readFileSync(
	path.resolve("geelooy/apps/code/js/tunnel/browser-agent-connection.js"),
	"utf8"
);
const requestSource = fs.readFileSync(
	path.resolve("geelooy/apps/code/js/tunnel/browser-agent-request.js"),
	"utf8"
);
const previewSource = fs.readFileSync(
	path.resolve("geelooy/apps/code/js/tunnel/browser-preview-actions.js"),
	"utf8"
);

assert.equal(COMMAND_ACTIONS.includes("commandRun"), true);
assert.equal(FS_ACTIONS.has("read"), true);
assert.equal(FS_ACTIONS.has("symbolOutline"), true);
assert.equal(BROWSER_PREVIEW_ACTIONS.includes("chromeNavigate"), true);
assert.equal(BROWSER_PREVIEW_ACTIONS.includes("hardTeset"), true);
assert.equal(
	ALL_BROWSER_TUNNEL_ACTIONS.length,
	new Set(ALL_BROWSER_TUNNEL_ACTIONS).size
);
assert.match(connectionSource, /browser-agent-capabilities\.js/);
assert.doesNotMatch(connectionSource, /browser-agent-request\.js/);
assert.match(requestSource, /browser-agent-capabilities\.js/);
assert.match(previewSource, /browser-agent-capabilities\.js/);

console.log(JSON.stringify({
	ok: true,
	suite: "browser-capability-isolation",
	capabilitiesImportWithoutBrowserRuntime: true,
	connectionAvoidsHeavyRequestGraph: true
}, null, 2));
