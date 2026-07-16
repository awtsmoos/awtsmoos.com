// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @file Executes the browser vessel collection with a bounded discovery stub.
 * @description
 * The Awtsmoos renews readable alias and stable route ID without confusing them.
 * Awtsmoos.com proves native vessels route by server ID, browser vessels retain
 * their names, and duplicate aliases remain distinct when their identities differ.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(here, "../../../../..");
const sourcePath = path.join(
	repositoryRoot,
	"geelooy/apps/tunnel-control/js/features/vessels/vesselCollection.js"
);
const original = fs.readFileSync(sourcePath, "utf8");
const importExpression = /import\s*\{[\s\S]*?\}\s*from\s*"\.\/deviceTrust\.js";/;
const executable = original.replace(importExpression, [
	"const VIRTUAL_OS_TUNNEL = \"awtsmoos-virtual-os\";",
	"const sanitizeDiscoveryResponse = value => value;"
].join("\n"));
assert.notEqual(executable, original, "device-trust import was replaced");
const moduleUrl = `data:text/javascript;base64,${Buffer.from(executable).toString("base64")}`;
const Collection = await import(moduleUrl);

const native = Collection.normalizeVessel({
	tunnelId: "tun_stable_native",
	tunnelName: "awt-friendly",
	kind: "native",
	ownershipVerified: true,
	access: "owned"
});
assert.equal(native.routeReference, "tun_stable_native");
assert.equal(native.displayName, "awt-friendly");

const browser = Collection.normalizeVessel({
	tunnelName: "browser-session",
	kind: "browser-tab",
	ownershipVerified: true,
	access: "owned"
});
assert.equal(browser.routeReference, "browser-session");

const vessels = Collection.collectVessels({
	browserDevices: [],
	nativeDevices: [
		{ ...native, tunnelId: "tun_one", routeReference: undefined },
		{ ...native, tunnelId: "tun_two", routeReference: undefined }
	],
	virtualDevice: null
});
assert.deepEqual(
	vessels.map((vessel) => vessel.routeReference),
	["tun_one", "tun_two"]
);

console.log(JSON.stringify({
	ok: true,
	suite: "stable-route-identity",
	nativeUsesTunnelId: true,
	displayAliasPreserved: true
}, null, 2));
