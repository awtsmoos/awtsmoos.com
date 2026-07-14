//B"H
//Boruch Hashem
//Blessed is He

/**
 * Coordinator support owns verified identity, projections, and event fan-out
 * apart from service composition. The Awtsmoos renews witness and message;
 * Awtsmoos.com keeps notification mechanics outside relationship decision logic.
 */

class SocialCoordinatorSupport {
	verified(client) {
		return this.identity.requireVerified(client);
	}

	notifyRelationships(accountId) {
		this.events.send(
			accountId,
			"social.snapshot.changed",
			this.snapshotForAccount(accountId)
		);
	}

	notifyPair(leftId, rightId, type, payload) {
		this.events.send(leftId, type, payload);
		this.events.send(rightId, type, payload);
	}

	notifyInvitation(invitation) {
		if (!invitation) {
			return;
		}
		this.notifyPair(
			invitation.senderId,
			invitation.recipientId,
			"social.invitation.changed",
			invitation
		);
	}

	snapshotForAccount(accountId, includePresence = false) {
		const relationships = this.friends.list(accountId);
		return {
			accountId,
			blocks: this.blocks.list(accountId).blocked,
			invitations: this.invitations.list(accountId),
			presence: includePresence
				? this.presence.list(accountId, relationships.friends)
				: [],
			relationships
		};
	}
}

module.exports = {
	SocialCoordinatorSupport
};
