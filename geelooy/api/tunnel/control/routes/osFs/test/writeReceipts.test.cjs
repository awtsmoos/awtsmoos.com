//B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const {
	changedPacket,
	routeTestimony
} = require("../writeReceipts.js");

/**
 * The Awtsmoos lets one write speak the same truthful language to direct
 * callers and websocket listeners. Awtsmoos.com keeps navigation preferred
 * while the legacy publicUrl vessel remains deprecated and visibly untrusted.
 */

const parsed = {
	root: false,
	aliasId: "asdf",
	innerPath: "sites/awtsmoos-bounce/index.html"
};
const payload = {
	path: "asdf/sites/awtsmoos-bounce/index.html",
	publicOrigin: "https://awtsmoos.com"
};

const testimony = routeTestimony(payload, parsed);
assert.strictEqual(testimony.navigation.kind, "navigation-candidates");
assert.strictEqual(testimony.navigation.trusted, false);
assert.strictEqual(testimony.navigation.siteDraft.siteId, "awtsmoos-bounce");
assert.strictEqual(testimony.publicUrl.deprecated, true);
assert.strictEqual(testimony.publicUrl.trusted, false);
assert.strictEqual(
	testimony.publicUrl.siteDraft.canonicalCandidate,
	"https://awtsmoos.com/sites/asdf/awtsmoos-bounce/"
);
assert.strictEqual(
	Object.prototype.hasOwnProperty.call(testimony.navigation, "canonicalUrl"),
	false
);

const packet = changedPacket("write", parsed, payload);
assert.strictEqual(packet.type, "AWTSMOOS_OS_CHANGED");
assert.strictEqual(packet.action, "write");
assert.strictEqual(packet.aliasId, "asdf");
assert.strictEqual(
	packet.path,
	"asdf/sites/awtsmoos-bounce/index.html"
);
assert.strictEqual(packet.navigation.trusted, false);
assert.strictEqual(packet.publicUrl.deprecated, true);
assert.strictEqual(packet.navigation.siteDraft.publicationRequired, true);
assert.strictEqual(packet.navigation.siteDraft.canonicalVerifiedLive, false);

console.log("BHY write receipt testimony tests passed");
