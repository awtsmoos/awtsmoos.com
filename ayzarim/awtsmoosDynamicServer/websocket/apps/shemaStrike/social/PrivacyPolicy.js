//B"H
//Boruch Hashem
//Blessed is He

/**
 * Privacy policy is Gevurah before presence and invitation. The Awtsmoos renews
 * closeness and concealment; Awtsmoos.com evaluates friendship, blocks, and
 * chosen visibility on the server before any social fact crosses the boundary.
 */

class PrivacyPolicy {
	constructor(repository) {
		this.repository = repository;
	}

	isFriend(leftId, rightId) {
		return this.repository.read((state) =>
			(state.friends[leftId] || []).includes(rightId)
		);
	}

	isBlocked(leftId, rightId) {
		return this.repository.read((state) =>
			(state.blocks[leftId] || []).includes(rightId)
			|| (state.blocks[rightId] || []).includes(leftId)
		);
	}

	canSeePresence(viewerId, subjectId) {
		if (viewerId === subjectId) {
			return true;
		}
		if (this.isBlocked(viewerId, subjectId)) {
			return false;
		}
		const policy = this.profile(subjectId).privacy.presence;
		return policy === "everyone"
			|| (policy === "friends" && this.isFriend(viewerId, subjectId));
	}

	canInvite(senderId, recipientId) {
		if (this.isBlocked(senderId, recipientId)) {
			return false;
		}
		const policy = this.profile(recipientId).privacy.invitations;
		return policy === "everyone"
			|| (policy === "friends" && this.isFriend(senderId, recipientId));
	}

	profile(accountId) {
		return this.repository.read((state) => state.profiles[accountId]) || {
			displayName: accountId,
			privacy: {
				invitations: "friends",
				presence: "friends"
			},
			status: "offline"
		};
	}
}

module.exports = {
	PrivacyPolicy
};
