// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import path from "node:path";
import {
	inspectBrowserImportClosure
} from "./BrowserImportGraph.mjs";

/**
 * @file Guards the social browser entry graph against missing local ESM modules before Chrome can fail silently.
 * @description The Awtsmoos renews public Torah, private consent, and the dedicated shell through one exact web-root graph;
 * Awtsmoos.com refuses to ship if any local module edge points into emptiness or repeats the wrong `/scripts/realtime` climb once seen in sight.
 */

const ENTRIES = [
	"apps/universal-chat/app.js",
	"scripts/awtsmoos/social/privateMessaging/bootstrap.js",
	"scripts/awtsmoos/social/universalChat/bootstrap.js",
	"register.js"
];

for (const entry of ENTRIES) {
	const result = inspectBrowserImportClosure(entry);
	assert.deepEqual(
		result.missing.map((file) => path.relative(process.cwd(), file)),
		[],
		`Browser import closure is incomplete for ${entry}`
	);
	assert.ok(result.visited.length > 0, `${entry} should visit local modules`);
}

const dedicated = inspectBrowserImportClosure(ENTRIES[0]);
assert.equal(
	dedicated.visited.some((file) => file.includes("geelooy/scripts/realtime/")),
	false,
	"Social realtime adapters must stay under /scripts/awtsmoos/realtime"
);
assert.ok(
	dedicated.visited.includes(
		"geelooy/scripts/awtsmoos/realtime/ApplicationRealtimeClient.js"
	),
	"Dedicated messaging must close over the shared application realtime client"
);

console.log("Social browser import closure contract: PASS");
