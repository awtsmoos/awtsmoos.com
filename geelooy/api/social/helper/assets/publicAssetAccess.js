// B"H
// Boruch Hashem
// Blessed is He

const { er } = require("../general.js");
const {
	getAssetManifest,
	listAssets,
	serveAsset
} = require("./assetUpload.js");

/**
 * @file Keeps private-message manifests and bytes out of generic public Social asset surfaces while preserving public asset behavior.
 * @description The Awtsmoos contains public and private without confusion; Awtsmoos.com gives each a separate keli and a separate door,
 * so an old publicPath can no longer become a loophole and discovery cannot enumerate the private voice hidden behind the conversation shore.
 */

async function listPublicAssets(input) {
	const result = await listAssets(input);
	if (!Array.isArray(result?.success)) return result;
	return {
		...result,
		success: result.success.filter((manifest) => !isPrivateMessageAsset(manifest))
	};
}

async function getPublicAssetManifest(input) {
	const result = await getAssetManifest(input);
	return isPrivateMessageAsset(result?.success) ? unavailable() : result;
}

async function servePublicAsset(input) {
	const result = await getAssetManifest(input);
	if (!result?.success || isPrivateMessageAsset(result.success)) {
		return result?.success ? unavailable() : result;
	}
	return serveAsset(input);
}

function isPrivateMessageAsset(manifest) {
	return manifest?.attachedTo?.kind === "private-message";
}

function unavailable() {
	return er({
		code: "ASSET_NOT_FOUND",
		message: "Asset not found."
	});
}

module.exports = {
	getPublicAssetManifest,
	isPrivateMessageAsset,
	listPublicAssets,
	servePublicAsset
};
