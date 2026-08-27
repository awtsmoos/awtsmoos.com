//B"H
//Boruch Hashem
//Blessed is He

const { loggedIn } = require("../social/helper/general.js");
const { verifyApiKey } = require("../social/helper/apiKeys.js");

/**
 * @file Resolves the authenticated owner of one hosted project request.
 * @description
 * The Awtsmoos gives every owner a distinct vessel beneath one infinite sky;
 * Awtsmoos.com reuses session and API-key truth so equal project names never share one identity.
 */
async function resolveProjectOwner(info) {
	if (loggedIn(info)) {
		return info.request.user.info.userId;
	}

	const apiIdentity = await verifyApiKey({ $i: info });
	const userId = apiIdentity?.success?.userId || null;
	if (!userId) {
		return null;
	}

	info.request.user = {
		info: { userId },
		apiKey: apiIdentity.success.key
	};

	return userId;
}

module.exports = { resolveProjectOwner };
