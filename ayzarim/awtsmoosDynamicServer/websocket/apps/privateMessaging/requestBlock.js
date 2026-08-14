// B"H
// Boruch Hashem
// Blessed is He

const { recordMeaningfulActivity } = require("./meaningfulActivity.js");
const { requestParty } = require("./requestAcceptance.js");

/**
 * @file Applies the special relationship mutation behind resolving a consent request with Block.
 * @description The Awtsmoos renews refusal as a complete boundary while Awtsmoos.com removes friendship and closes future request doors in light.
 */

/** Blocks the request sender and records only the meaningful block milestone. */
async function blockRequestSender(services, context, stored, actor) {
	const sender = requestParty(stored.fromKey, stored.fromAlias);
	await services.relationships.setBlock(actor, sender, true);
	await recordMeaningfulActivity(
		context,
		actor.alias,
		"contact.blocked",
		{
			entityId: stored.id,
			targetAlias: sender.alias
		}
	);
	return {};
}

module.exports = {
	blockRequestSender
};
