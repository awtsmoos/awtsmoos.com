// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { servePrivateMessageAsset } = require("./privateMessageAssetAccess.js");
const {
	getPublicAssetManifest,
	listPublicAssets,
	servePublicAsset
} = require("./publicAssetAccess.js");
const {
	IDS,
	createPrivateImageFixture
} = require("./privateMessageImageAssetTestSupport.js");

/**
 * @file Proves private image bytes require current membership plus exact canonical coordinates and never leak through generic Social asset surfaces.
 * @description The Awtsmoos contains image and relation together; Awtsmoos.com permits only the exact current member to receive no-store bytes,
 * while outsiders, former members, mutated coordinates, and public discovery all meet one opaque unavailable boundary.
 */

test("current member receives exact private image bytes with non-cacheable headers", async () => {
	const fixture = createPrivateImageFixture();
	const bytes = await servePrivateMessageAsset({
		$i: fixture.$i,
		userid: "account-member",
		coordinates: fixture.coordinates
	});
	assert.ok(Buffer.isBuffer(bytes));
	assert.equal(fixture.headers["content-type"], "image/png");
	assert.equal(fixture.headers["cache-control"], "private, no-store, max-age=0");
	assert.equal(fixture.headers.pragma, "no-cache");
	assert.equal(fixture.headers["x-content-type-options"], "nosniff");
});

test("outsider, former member, and every mutated message coordinate receive the same denial", async () => {
	const fixture = createPrivateImageFixture();
	const mutations = [
		{ userid: "account-outsider", coordinates: fixture.coordinates },
		{ userid: "account-member", coordinates: { ...fixture.coordinates, conversationId: "wrong-room" } },
		{ userid: "account-member", coordinates: { ...fixture.coordinates, sequence: 2 } },
		{ userid: "account-member", coordinates: { ...fixture.coordinates, messageId: "wrong-message" } },
		{ userid: "account-member", coordinates: { ...fixture.coordinates, assetId: "wrong-asset" } }
	];
	for (const input of mutations) {
		const denied = await servePrivateMessageAsset({ $i: fixture.$i, ...input });
		assert.equal(denied.error.code, "PRIVATE_MESSAGE_ASSET_UNAVAILABLE");
	}
	fixture.data[`/social/privateMessaging/conversations/${IDS.conversationId}`].members = {};
	const former = await servePrivateMessageAsset({
		$i: fixture.$i,
		userid: "account-member",
		coordinates: fixture.coordinates
	});
	assert.equal(former.error.code, "PRIVATE_MESSAGE_ASSET_UNAVAILABLE");
});

test("private image manifest and bytes disappear from every generic public asset surface", async () => {
	const fixture = createPrivateImageFixture();
	const input = { $i: fixture.$i, aliasId: IDS.aliasId, assetId: IDS.assetId };
	const manifest = await getPublicAssetManifest(input);
	const bytes = await servePublicAsset(input);
	const list = await listPublicAssets({ $i: fixture.$i, aliasId: IDS.aliasId });
	assert.equal(manifest.error.code, "ASSET_NOT_FOUND");
	assert.equal(bytes.error.code, "ASSET_NOT_FOUND");
	assert.deepEqual(list.success, []);
});
