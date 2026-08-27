// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Projection = require("../devicePublicProjection.js");
const Discovery = require("../deviceDiscovery.js");

/**
 * @file Proves public device discovery exposes counts and digests, never action inventories.
 * @description
 * The Awtsmoos holds 928 inner deeds behind fourteen outward doors; Awtsmoos.com lets
 * discovery stay light enough to travel while provenance remains exact in every layer.
 */
const publicActions = [
	"agent", "batch", "browser", "command", "files", "git", "mission",
	"preview", "recover", "runtime", "status", "system", "test", "web"
];
const internal = Array.from({ length: 928 }, (_, index) => `internalAction${index}`);
const native = {
	tunnelId: "tun_compact_manifest",
	tunnelName: "awt-compact-manifest",
	routeReference: "tun_compact_manifest",
	connected: true,
	kind: "native-tunnel",
	releaseSourceSha: "a".repeat(40),
	actionManifestHash: "b".repeat(64),
	actionSchemaDigest: "c".repeat(64),
	publicActionDigest: "d".repeat(64),
	publicActionCount: 14,
	supportedActions: publicActions,
	actionManifest: { fs: internal }
};

const projected = Projection.device(native);
assert.equal(projected.supportedActions, undefined);
assert.equal(projected.actionManifest, undefined);
assert.equal(projected.supportedActionCount, 14);
assert.equal(projected.publicActionCount, 14);
assert.equal(projected.supportedActionsTruncated, true);
assert.equal(projected.actionManifestHash, native.actionManifestHash);
assert.equal(projected.publicActionDigest, native.publicActionDigest);

const response = Discovery.responseBase({
	identity: { accountId: "account-compact" },
	nativeDevices: [native],
	historicalNativeDevices: [],
	historySummary: {},
	browserDevices: [],
	virtualDevice: { kind: "virtual-os" },
	devices: [native],
	warnings: []
});
const serialized = JSON.stringify(response);
assert.equal(response.nativeDevices[0].supportedActionCount, 14);
assert.equal(response.nativeDevices[0].actionManifest, undefined);
assert.equal(serialized.includes("internalAction927"), false);
assert.equal(serialized.includes('"supportedActions"'), false);
console.log(JSON.stringify({ ok: true, publicActionCount: 14, internalActionCount: 928 }));
