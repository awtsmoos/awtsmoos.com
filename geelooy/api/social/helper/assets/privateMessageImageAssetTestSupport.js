// B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const { hashAccount } = require("./privateMessageAssetProof.js");

/**
 * @file Builds one mutable image-authorization fixture without touching production Social storage.
 * @description The Awtsmoos knows member, message, manifest, and bytes before a test divides them; Awtsmoos.com keeps this fixture small so each
 * authorization witness can mutate one coordinate or covenant at a time while exercising the real private-media proof and serving path.
 */
const IDS = Object.freeze({
	conversationId: "private-image-room",
	messageId: "msg-private-image",
	assetId: "asset-private-image",
	aliasId: "PrivateImageAliasContract"
});

function createPrivateImageFixture() {
	const headers = {};
	const storagePath = __filename;
	const size = fs.statSync(storagePath).size;
	const memberKey = hashAccount("account-member");
	const data = {
		[`/social/privateMessaging/conversations/${IDS.conversationId}`]: {
			id: IDS.conversationId,
			members: { [memberKey]: { alias: IDS.aliasId } }
		},
		[`/social/privateMessaging/messages/${IDS.conversationId}/pages/0`]: [{
			id: IDS.messageId,
			conversationId: IDS.conversationId,
			sequence: 1,
			alias: IDS.aliasId,
			attachment: {
				id: IDS.assetId,
				type: "image",
				mime: "image/png",
				size
			}
		}],
		[`/social/aliases/${IDS.aliasId}/assets/${IDS.assetId}`]: {
			id: IDS.assetId,
			aliasId: IDS.aliasId,
			ownerAlias: IDS.aliasId,
			type: "image",
			mime: "image/png",
			size,
			storagePath,
			attachedTo: { kind: "private-message" }
		}
	};
	const $i = {
		db: { async get(path) { return data[path] ?? null; } },
		setHeader(name, value) { headers[name] = value; }
	};
	return {
		$i,
		data,
		headers,
		memberKey,
		coordinates: {
			conversationId: IDS.conversationId,
			sequence: 1,
			messageId: IDS.messageId,
			assetId: IDS.assetId
		}
	};
}

module.exports = {
	IDS,
	createPrivateImageFixture
};
