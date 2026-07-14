//B"H
//Boruch Hashem
//Blessed is He

/**
 * Blocking is a server-owned shield that atomically closes every social doorway.
 * The Awtsmoos renews consent and distance; Awtsmoos.com removes friendship,
 * requests, and invitations together so contradictory permissions never survive.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");
const { removeFriendship } = require("./FriendGraph.js");

class BlockGraph {
	constructor(repository) {
		this.repository = repository;
	}

	block(accountId, targetId) {
		if (accountId === targetId) {
			throw new RealtimeError("SELF_BLOCK_FORBIDDEN", "An account cannot block itself.");
		}
		return this.repository.mutate((state) => {
			state.blocks[accountId] = [
				...new Set([...(state.blocks[accountId] || []), targetId])
			];
			removeFriendship(state, accountId, targetId);
			removeRequests(state, accountId, targetId);
			cancelInvitations(state, accountId, targetId);
			return {
				blocked: true,
				targetId
			};
		});
	}

	unblock(accountId, targetId) {
		return this.repository.mutate((state) => {
			state.blocks[accountId] = (state.blocks[accountId] || [])
				.filter((id) => id !== targetId);
			return {
				blocked: false,
				targetId
			};
		});
	}

	list(accountId) {
		return this.repository.read((state) => ({
			blocked: state.blocks[accountId] || []
		}));
	}
}

function removeRequests(state, leftId, rightId) {
	for (const request of Object.values(state.friendRequests)) {
		if (samePair(request.senderId, request.recipientId, leftId, rightId)) {
			delete state.friendRequests[request.id];
		}
	}
}

function cancelInvitations(state, leftId, rightId) {
	for (const invitation of Object.values(state.invitations)) {
		if (invitation.status === "pending"
			&& samePair(invitation.senderId, invitation.recipientId, leftId, rightId)) {
			invitation.status = "cancelled-by-block";
			invitation.resolvedAt = Date.now();
		}
	}
}

function samePair(first, second, leftId, rightId) {
	return (first === leftId && second === rightId)
		|| (first === rightId && second === leftId);
}

module.exports = {
	BlockGraph
};
