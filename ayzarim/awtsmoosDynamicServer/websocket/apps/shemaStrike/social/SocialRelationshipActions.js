//B"H
//Boruch Hashem
//Blessed is He

/**
 * Relationship actions gather verified friend and block mutations outside the
 * composition root. The Awtsmoos renews covenant and boundary; Awtsmoos.com
 * notifies both accounts after the server has atomically changed the graph.
 */

const { validateTargetAccount } = require("./SocialValidation.js");

class SocialRelationshipActions {
	constructor(coordinator) {
		this.coordinator = coordinator;
	}

	friendRequest(client, targetValue) {
		const actor = this.coordinator.verified(client);
		const targetId = validateTargetAccount(targetValue);
		const result = this.coordinator.friends.request(actor.accountId, targetId);
		this.coordinator.notifyPair(
			actor.accountId,
			targetId,
			"social.friend.changed",
			result
		);
		return result;
	}

	friendResolve(client, requestId, action) {
		const actor = this.coordinator.verified(client);
		const result = this.coordinator.friends[action](
			actor.accountId,
			String(requestId || "")
		);
		this.coordinator.notifyRelationships(actor.accountId);
		return result;
	}

	friendRemove(client, targetValue) {
		const actor = this.coordinator.verified(client);
		const targetId = validateTargetAccount(targetValue);
		const result = this.coordinator.friends.remove(actor.accountId, targetId);
		this.coordinator.notifyPair(
			actor.accountId,
			targetId,
			"social.friend.changed",
			result
		);
		return result;
	}

	block(client, targetValue) {
		const actor = this.coordinator.verified(client);
		const targetId = validateTargetAccount(targetValue);
		const result = this.coordinator.blocks.block(actor.accountId, targetId);
		this.coordinator.notifyPair(
			actor.accountId,
			targetId,
			"social.block.changed",
			result
		);
		return result;
	}

	unblock(client, targetValue) {
		const actor = this.coordinator.verified(client);
		const targetId = validateTargetAccount(targetValue);
		const result = this.coordinator.blocks.unblock(actor.accountId, targetId);
		this.coordinator.events.send(
			actor.accountId,
			"social.block.changed",
			result
		);
		return result;
	}
}

module.exports = {
	SocialRelationshipActions
};
