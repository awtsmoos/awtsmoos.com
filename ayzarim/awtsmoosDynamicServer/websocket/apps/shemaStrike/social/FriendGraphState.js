//B"H
//Boruch Hashem
//Blessed is He

/**
 * Friendship state helpers hold symmetric mutation details outside the service
 * that decides when they may occur. The Awtsmoos renews both ends of every bond;
 * Awtsmoos.com writes and removes each side together so the graph cannot split.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");

function friendSet(state, accountId) {
	return new Set(state.friends[accountId] || []);
}

function findRequest(state, senderId, recipientId) {
	return Object.values(state.friendRequests)
		.find((request) => request.senderId === senderId
			&& request.recipientId === recipientId);
}

function addFriendship(state, leftId, rightId) {
	state.friends[leftId] = [
		...new Set([...(state.friends[leftId] || []), rightId])
	];
	state.friends[rightId] = [
		...new Set([...(state.friends[rightId] || []), leftId])
	];
}

function removeFriendship(state, leftId, rightId) {
	state.friends[leftId] = (state.friends[leftId] || [])
		.filter((id) => id !== rightId);
	state.friends[rightId] = (state.friends[rightId] || [])
		.filter((id) => id !== leftId);
}

function requireRequest(state, requestId) {
	const request = state.friendRequests[requestId];
	if (!request) {
		throw new RealtimeError(
			"FRIEND_REQUEST_NOT_FOUND",
			"Friend request was not found."
		);
	}
	return request;
}

module.exports = {
	addFriendship,
	findRequest,
	friendSet,
	removeFriendship,
	requireRequest
};
