// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { exactManifest } = require("./privateMessageAssetProof.js");
const {
	IDS,
	createPrivateImageFixture
} = require("./privateMessageImageAssetTestSupport.js");

/**
 * @file Proves canonical image metadata must match the message projection and real storage exactly before byte serving can proceed.
 * @description The Awtsmoos is beyond manifest and file, yet Awtsmoos.com accepts neither appearance nor partial equality as authority; alias,
 * owner, attachment kind, media type, MIME, size, and actual byte file must all remain one exact relation.
 */

test("private image manifest proof rejects every ownership, media, size, and storage mismatch", () => {
	const fixture = createPrivateImageFixture();
	const message = fixture.data[`/social/privateMessaging/messages/${IDS.conversationId}/pages/0`][0];
	const manifest = fixture.data[`/social/aliases/${IDS.aliasId}/assets/${IDS.assetId}`];
	assert.equal(exactManifest(manifest, message, IDS.aliasId, IDS.assetId), true);
	const mutations = [
		{ aliasId: "OtherAlias" },
		{ ownerAlias: "OtherAlias" },
		{ attachedTo: { kind: "public-post" } },
		{ type: "audio" },
		{ mime: "image/jpeg" },
		{ size: manifest.size + 1 },
		{ storagePath: `${manifest.storagePath}.missing` }
	];
	for (const patch of mutations) {
		assert.equal(
			exactManifest({ ...manifest, ...patch }, message, IDS.aliasId, IDS.assetId),
			false
		);
	}
});
