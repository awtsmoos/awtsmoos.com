// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const fs = require("fs");
const {
	hashAccount
} = require("./privateMessageAssetProof.js");
const {
	servePrivateMessageAsset
} = require("./privateMessageAssetAccess.js");
const {
	getPublicAssetManifest,
	listPublicAssets,
	servePublicAsset
} = require("./publicAssetAccess.js");

/**
 * @file Proves private-message bytes require exact membership/message/attachment coordinates and disappear from every generic public asset surface.
 * @description The Awtsmoos can reveal one private voice only inside its relationship; Awtsmoos.com refuses knowledge-by-URL and proves every gate,
 * returning no-store bytes to a member while wrong user, wrong coordinate, and public discovery all meet the same closed boundary at the gate.
 */

const conversationId = "private-media-room";
const messageId = "msg-private-media";
const assetId = "asset-private-media";
const aliasId = "PrivateMediaAliasContract";
const storagePath = __filename;
const size = fs.statSync(storagePath).size;

function createContext() {
	const headers = {};
	const data = {
		[`/social/privateMessaging/conversations/${conversationId}`]: {
			id: conversationId,
			members: { [hashAccount("account-a")]: { alias: aliasId } }
		},
		[`/social/privateMessaging/messages/${conversationId}/pages/0`]: [{
			id: messageId,
			conversationId,
			sequence: 1,
			alias: aliasId,
			attachment: { id: assetId, type: "audio", mime: "audio/webm", size }
		}],
		[`/social/aliases/${aliasId}/assets/${assetId}`]: {
			id: assetId,
			aliasId,
			ownerAlias: aliasId,
			type: "audio",
			mime: "audio/webm",
			size,
			storagePath,
			attachedTo: { kind: "private-message" }
		}
	};
	return {
		headers,
		$i: {
			db: { async get(path) { return data[path] ?? null; } },
			setHeader(name, value) { headers[name] = value; }
		}
	};
}

async function runPrivateMediaContract() {
	const { $i, headers } = createContext();
	const coordinates = { conversationId, sequence: 1, messageId, assetId };
	const bytes = await servePrivateMessageAsset({ $i, userid: "account-a", coordinates });
	assert.ok(Buffer.isBuffer(bytes));
	assert.equal(headers["cache-control"], "private, no-store, max-age=0");
	assert.equal(headers["x-content-type-options"], "nosniff");
	const denied = await servePrivateMessageAsset({ $i, userid: "account-c", coordinates });
	assert.equal(denied.error.code, "PRIVATE_MESSAGE_ASSET_UNAVAILABLE");
	const wrongMessage = await servePrivateMessageAsset({
		$i,
		userid: "account-a",
		coordinates: { ...coordinates, messageId: "msg-wrong" }
	});
	assert.equal(wrongMessage.error.code, "PRIVATE_MESSAGE_ASSET_UNAVAILABLE");
	const manifest = await getPublicAssetManifest({ $i, aliasId, assetId });
	assert.equal(manifest.error.code, "ASSET_NOT_FOUND");
	const publicBytes = await servePublicAsset({ $i, aliasId, assetId });
	assert.equal(publicBytes.error.code, "ASSET_NOT_FOUND");
	const list = await listPublicAssets({ $i, aliasId });
	assert.deepEqual(list.success, []);
}

runPrivateMediaContract().then(() => {
	console.log("Private message asset authorization contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
