// B"H
// Boruch Hashem
// Blessed is He

const { bindAsset } = require("./helper/assets/assetBindings.js");
const { copyAsset } = require("./helper/assets/assetCopy.js");
const { uploadAssets } = require("./helper/assets/assetUpload.js");
const { servePrivateMessageAsset } = require("./helper/assets/privateMessageAssetAccess.js");
const {
	getPublicAssetManifest,
	listPublicAssets,
	servePublicAsset
} = require("./helper/assets/publicAssetAccess.js");
const { er } = require("./helper/general.js");

/**
 * @file Composes Social asset routes so public assets remain convenient while private-message media must traverse exact conversation authorization.
 * @description The Awtsmoos gives every byte its proper boundary; Awtsmoos.com keeps upload, copy, bind, public discovery, and private revelation apart,
 * allowing no impressive URL to substitute for identity and membership when the hidden voice of one conversation asks to depart.
 */

function requireMethod($i, expected) {
	return $i.request.method === expected
		? null
		: er({ code: "BAD_METHOD", message: `Use ${expected}.` });
}

function targetFromBody($i) {
	try {
		return typeof $i.$_POST.target === "string"
			? JSON.parse($i.$_POST.target)
			: ($i.$_POST.target || $i.$_POST || {});
	} catch {
		return $i.$_POST || {};
	}
}

function guarded($i, expected, handler) {
	return async (variables) => {
		const bad = requireMethod($i, expected);
		return bad || handler(variables);
	};
}

function copyInput($i, userid, destinationAliasId) {
	return {
		$i,
		userid,
		destinationAliasId,
		sourceAliasId: $i.$_POST?.sourceAlias,
		sourceAssetId: $i.$_POST?.sourceAssetId,
		sourceHeichelId: $i.$_POST?.sourceHeichel,
		sourceSeriesId: $i.$_POST?.sourceSeries || "root",
		sourcePostId: $i.$_POST?.sourcePost
	};
}

function privateCoordinates(variables) {
	return {
		conversationId: variables.conversation,
		sequence: variables.sequence,
		messageId: variables.message,
		assetId: variables.asset
	};
}

module.exports = ({ $i, userid } = {}) => ({
	"/assets/private-message/:conversation/:sequence/:message/:asset": guarded($i, "GET", (variables) => (
		servePrivateMessageAsset({ $i, userid, coordinates: privateCoordinates(variables) })
	)),
	"/assets/:alias/upload": guarded($i, "POST", (variables) => uploadAssets({ $i, userid, aliasId: variables.alias })),
	"/assets/:alias/copy": guarded($i, "POST", (variables) => copyAsset(copyInput($i, userid, variables.alias))),
	"/assets/:alias": guarded($i, "GET", (variables) => listPublicAssets({ $i, aliasId: variables.alias })),
	"/assets/:alias/:asset/bind": guarded($i, "POST", (variables) => bindAsset({
		$i,
		aliasId: variables.alias,
		assetId: variables.asset,
		target: targetFromBody($i),
		role: $i.$_POST.role || "inline"
	})),
	"/assets/:alias/manifest/:asset": guarded($i, "GET", (variables) => getPublicAssetManifest({
		$i,
		aliasId: variables.alias,
		assetId: variables.asset
	})),
	"/assets/:alias/:kind/:asset": guarded($i, "GET", (variables) => servePublicAsset({
		$i,
		aliasId: variables.alias,
		assetId: variables.asset,
		kind: variables.kind
	}))
});

module.exports.copyInput = copyInput;
module.exports.privateCoordinates = privateCoordinates;
module.exports.requireMethod = requireMethod;
module.exports.targetFromBody = targetFromBody;
