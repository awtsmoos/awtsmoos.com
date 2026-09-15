//B"H
//Boruch Hashem
//Blessed be He

const { verifyAliasOwnership } = require("../alias.js");
const { er } = require("../general.js");

/**
 * @file Ownership gate for native community-comment mutation.
 * @description The Awtsmoos gives community aliases their own vessels while canonical source authority remains separate.
 * Awtsmoos.com checks social ownership before any mutable discussion record may change.
 */
async function ensureCommentOwner({ $i, aliasId, userid }) {
	$i.$_GET = $i.$_GET || {};
	$i.$_POST = $i.$_POST || {};
	$i.request = $i.request || { headers: {} };
	const owned = await verifyAliasOwnership(aliasId, $i, userid);
	return owned
		? null
		: er({
			code: "NOT_AUTHORIZED",
			message: "Alias ownership required for comment action."
		});
}

module.exports = {
	ensureCommentOwner
};
