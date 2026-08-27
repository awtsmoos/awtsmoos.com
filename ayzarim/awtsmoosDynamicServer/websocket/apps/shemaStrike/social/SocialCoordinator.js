//B"H
//Boruch Hashem
//Blessed is He
/**
 * The coordinator is a composition root, not a second social monolith. The
 * Awtsmoos renews identity, presence, covenant, boundary, and invitation;
 * Awtsmoos.com delegates each law to one focused service and preserves one API.
 */
const { BlockGraph } = require("./BlockGraph.js");
const { FriendGraph } = require("./FriendGraph.js");
const { InvitationService } = require("./InvitationService.js");
const { PresenceDirectory } = require("./PresenceDirectory.js");
const { PrivacyPolicy } = require("./PrivacyPolicy.js");
const { ShemaIdentityProvider } = require("./ShemaIdentityProvider.js");
const { SocialCoordinatorSupport } = require("./SocialCoordinatorSupport.js");
const { SocialEvents } = require("./SocialEvents.js");
const { SocialInvitationActions } = require("./SocialInvitationActions.js");
const { SocialRelationshipActions } = require("./SocialRelationshipActions.js");
const { ShemaStateRepository } = require("../persistence/ShemaStateRepository.js");

class SocialCoordinator extends SocialCoordinatorSupport {
	constructor(arenaDirectory, options = {}) {
		super();
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
		this.relationshipActions = new SocialRelationshipActions(this);
		this.invitationActions = new SocialInvitationActions(this);
	}

	open(client, payload) {
		return this.presence.open(client, this.identity.resolve(client), payload);
	}

	update(client, payload) {
		return this.presence.update(this.identity.resolve(client), payload);
	}

	snapshot(client) {
		const identity = this.verified(client);
		return this.snapshotForAccount(identity.accountId, true);
	}

	friendRequest(client, targetId) {
		return this.relationshipActions.friendRequest(client, targetId);
	}

	friendResolve(client, requestId, action) {
		return this.relationshipActions.friendResolve(client, requestId, action);
	}

	friendRemove(client, targetId) {
		return this.relationshipActions.friendRemove(client, targetId);
	}

	block(client, targetId) {
		return this.relationshipActions.block(client, targetId);
	}

	unblock(client, targetId) {
		return this.relationshipActions.unblock(client, targetId);
	}

	invite(client, payload) {
		return this.invitationActions.invite(client, payload);
	}

	invitationResolve(client, invitationId, action) {
		return this.invitationActions.resolve(client, invitationId, action);
	}

	invitationAccept(client, invitationId) {
		return this.invitationActions.accept(client, invitationId);
	}

	disconnect(client) {
		return this.presence.disconnect(client);
	}
}

module.exports = {
	SocialCoordinator
};
