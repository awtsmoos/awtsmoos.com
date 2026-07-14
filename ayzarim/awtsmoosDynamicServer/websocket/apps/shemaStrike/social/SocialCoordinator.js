//B"H
//Boruch Hashem
//Blessed is He

/**
 * The coordinator composes identity, presence, relationships, blocks, privacy,
 * invitations, and persistence without teaching the socket their inner laws.
 * The Awtsmoos renews every covenant; Awtsmoos.com keeps each service bounded.
 */

const { BlockGraph } = require("./BlockGraph.js");
const { FriendGraph } = require("./FriendGraph.js");
const { InvitationService } = require("./InvitationService.js");
const { PresenceDirectory } = require("./PresenceDirectory.js");
const { PrivacyPolicy } = require("./PrivacyPolicy.js");
const { ShemaIdentityProvider } = require("./ShemaIdentityProvider.js");
const { SocialEvents } = require("./SocialEvents.js");
const {
	validateInvitation,
	validateTargetAccount
} = require("./SocialValidation.js");
const { ShemaStateRepository } = require("../persistence/ShemaStateRepository.js");

class SocialCoordinator {
	constructor(arenaDirectory, options = {}) {
		this.repository = options.repository || new ShemaStateRepository(options.persistence);
		this.identity = options.identityProvider || new ShemaIdentityProvider(options.identityResolver);
		this.events = options.events || new SocialEvents();
		this.privacy = new PrivacyPolicy(this.repository);
		this.presence = new PresenceDirectory(this.repository, this.events, this.privacy);
		this.friends = new FriendGraph(this.repository, this.privacy);
		this.blocks = new BlockGraph(this.repository);
		this.invitations = new InvitationService(
			this.repository,
			this.privacy,
			arenaDirectory,
			options.invitationOptions
		);
	}

	open(client, payload) {
		return this.presence.open(client, this.identity.resolve(client), payload);
	}

	update(client, payload) {
		return this.presence.update(this.identity.resolve(client), payload);
	}

	snapshot(client) {
		const identity = this.identity.requireVerified(client);
		const relationships = this.friends.list(identity.accountId);
		return {
			accountId: identity.accountId,
			blocks: this.blocks.list(identity.accountId).blocked,
			invitations: this.invitations.list(identity.accountId),
			presence: this.presence.list(identity.accountId, relationships.friends),
			relationships
		};
	}

	friendRequest(client, targetValue) {
		const actor = this.verified(client);
		const targetId = validateTargetAccount(targetValue);
		const result = this.friends.request(actor.accountId, targetId);
		this.notifyPair(actor.accountId, targetId, "social.friend.changed", result);
		return result;
	}

	friendResolve(client, requestId, action) {
		const actor = this.verified(client);
		const result = this.friends[action](actor.accountId, String(requestId || ""));
		this.notifyRelationships(actor.accountId);
		return result;
	}

	friendRemove(client, targetValue) {
		const actor = this.verified(client);
		const targetId = validateTargetAccount(targetValue);
		const result = this.friends.remove(actor.accountId, targetId);
		this.notifyPair(actor.accountId, targetId, "social.friend.changed", result);
		return result;
	}

	block(client, targetValue) {
		const actor = this.verified(client);
		const targetId = validateTargetAccount(targetValue);
		const result = this.blocks.block(actor.accountId, targetId);
		this.notifyPair(actor.accountId, targetId, "social.block.changed", result);
		return result;
	}

	unblock(client, targetValue) {
		const actor = this.verified(client);
		const targetId = validateTargetAccount(targetValue);
		const result = this.blocks.unblock(actor.accountId, targetId);
		this.events.send(actor.accountId, "social.block.changed", result);
		return result;
	}

	invite(client, payload) {
		const actor = this.verified(client);
		const invitation = this.invitations.create(client, actor.accountId, validateInvitation(payload));
		this.notifyPair(actor.accountId, invitation.recipientId, "social.invitation.changed", invitation);
		return invitation;
	}

	invitationResolve(client, invitationId, action) {
		const actor = this.verified(client);
		const result = this.invitations[action](actor.accountId, String(invitationId || ""));
		this.notifyInvitation(result);
		return result;
	}

	invitationAccept(client, invitationId) {
		const actor = this.verified(client);
		const result = this.invitations.accept(client, actor.accountId, String(invitationId || ""));
		this.notifyInvitation(result.invitation);
		return result;
	}

	disconnect(client) {
		return this.presence.disconnect(client);
	}

	verified(client) {
		return this.identity.requireVerified(client);
	}

	notifyRelationships(accountId) {
		this.events.send(accountId, "social.snapshot.changed", this.snapshotForAccount(accountId));
	}

	notifyPair(leftId, rightId, type, payload) {
		this.events.send(leftId, type, payload);
		this.events.send(rightId, type, payload);
	}

	notifyInvitation(invitation) {
		if (invitation) {
			this.notifyPair(invitation.senderId, invitation.recipientId, "social.invitation.changed", invitation);
		}
	}

	snapshotForAccount(accountId) {
		return {
			blocks: this.blocks.list(accountId).blocked,
			invitations: this.invitations.list(accountId),
			relationships: this.friends.list(accountId)
		};
	}
}

module.exports = {
	SocialCoordinator
};
