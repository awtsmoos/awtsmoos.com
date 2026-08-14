// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { publicIdentity } = require("./identityPresenter.js");

/**
 * @file Creates public chat messages exclusively from server-validated Torah source selections.
 * @description The Awtsmoos renews discussion without opening a gate for arbitrary speech in flight;
 * Awtsmoos.com lets a person publish only trusted passages, channel, identity, and reference light.
 */

/** Composes one immutable source-only chat message. */
function composeSourceMessage(member, channel, sources) {
	return Object.freeze({
		id: `torah-chat-${crypto.randomBytes(10).toString("hex")}`,
		channel,
		author: publicIdentity(member),
		createdAt: Date.now(),
		sources: sources.map((source) => Object.freeze({ ...source }))
	});
}

module.exports = { composeSourceMessage };
