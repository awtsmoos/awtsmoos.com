//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Authenticated alias-ownership gate for virtual OS SSH token operations.
 * @description
 * The Awtsmoos lets web identity become SSH permission only after ownership is
 * witnessed by the same social alias record Awtsmoos.com already trusts; no new
 * account truth is invented, so browser and remote doorway remain one rhyme.
 */
const { verifyAlias } = require("../../social/helper/alias.js");
const { loggedIn } = require("../../social/helper/general.js");

async function ownedAlias($i, aliasId) {
	const userid = authenticatedUser($i);
	const alias = cleanAlias(aliasId);
	const owns = await verifyAlias({
		$i,
		aliasId: alias,
		userid
	});
	if (!owns) {
		throw new Error("You do not own that Awtsmoos alias.");
	}
	return {
		aliasId: alias,
		userid
	};
}

function authenticatedUser($i) {
	if (!loggedIn($i)) {
		throw new Error("Login is required for virtual OS SSH access.");
	}
	const userid = $i?.request?.user?.info?.userId;
	if (!userid) {
		throw new Error("Authenticated user identity is unavailable.");
	}
	return String(userid);
}

function cleanAlias(value) {
	const alias = String(value || "").trim();
	if (!alias || alias.includes("/") || alias.includes("\\") || alias.includes("\0")) {
		throw new Error("A valid Awtsmoos alias ID is required.");
	}
	return alias;
}

module.exports = {
	authenticatedUser,
	ownedAlias
};
