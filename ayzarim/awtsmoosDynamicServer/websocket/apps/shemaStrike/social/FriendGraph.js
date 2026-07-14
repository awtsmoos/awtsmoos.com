//B"H
//Boruch Hashem
//Blessed is He

/**
 * Friendship is a symmetric covenant reached through explicit request states.
 * The Awtsmoos renews giver and receiver; Awtsmoos.com makes duplicates
 * idempotent, crossing requests convergent, and removal distinct from blocking.
 */

const { randomUUID } = require("node:crypto");
const { RealtimeError } = require("../../../platform/RealtimeError.js");
const State = require("./FriendGraphState.js");

class FriendGraph {
	constructor(repository, privacy) {
		this.repository = repository;
		this.privacy = privacy;
	}

	request(senderId, recipientId) {
		this.requirePair(senderId, recipientId);
		return this.repository.mutate((state) => {
			if (State.friendSet(state, senderId).has(recipientId)) {
				return { status: "friends" };
			}
			const same = State.findRequest(state, senderId, recipientId);
			if (same) {
				return { request: same, status: "pending" };
			}
			const crossing = State.findRequest(state, recipientId, senderId);
			if (crossing) {
				delete state.friendRequests[crossing.id];
				State.addFriendship(state, senderId, recipientId);
				return { status: "friends" };
			}
			const request = createRequest(senderId, recipientId);
			state.friendRequests[request.id] = request;
			return { request, status: "pending" };
		});
	}

	accept(accountId, requestId) {
		return this.resolve(accountId, requestId, "accepted");
	}

	decline(accountId, requestId) {
		return this.resolve(accountId, requestId, "declined");
	}

	cancel(accountId, requestId) {
		return this.repository.mutate((state) => {
			const request = State.requireRequest(state, requestId);
			if (request.senderId !== accountId) {
				throw new RealtimeError("FRIEND_REQUEST_FORBIDDEN", "Only the sender may cancel this request.");
			}
			delete state.friendRequests[requestId];
			return { requestId, status: "cancelled" };
		});
	}

	remove(accountId, friendId) {
		return this.repository.mutate((state) => {
			State.removeFriendship(state, accountId, friendId);
			return { friendId, removed: true };
		});
	}

	list(accountId) {
		return this.repository.read((state) => ({
			friends: [...State.friendSet(state, accountId)],
			incoming: Object.values(state.friendRequests)
				.filter((request) => request.recipientId === accountId),
			outgoing: Object.values(state.friendRequests)
				.filter((request) => request.senderId === accountId)
		}));
	}

	resolve(accountId, requestId, decision) {
		return this.repository.mutate((state) => {
			const request = State.requireRequest(state, requestId);
			if (request.recipientId !== accountId) {
				throw new RealtimeError("FRIEND_REQUEST_FORBIDDEN", "Only the recipient may resolve this request.");
			}
			delete state.friendRequests[requestId];
			if (decision === "accepted") {
				State.addFriendship(state, request.senderId, request.recipientId);
			}
			return { requestId, status: decision };
		});
	}

	requirePair(senderId, recipientId) {
		if (senderId === recipientId) {
			throw new RealtimeError("SELF_FRIEND_FORBIDDEN", "An account cannot friend itself.");
		}
		if (this.privacy.isBlocked(senderId, recipientId)) {
			throw new RealtimeError("SOCIAL_BLOCKED", "A block prevents this relationship action.");
		}
	}
}

function createRequest(senderId, recipientId) {
	return {
		createdAt: Date.now(),
		id: randomUUID(),
		recipientId,
		senderId,
		status: "pending"
	};
}

module.exports = {
	FriendGraph,
	removeFriendship: State.removeFriendship
};
