//B"H
//Boruch Hashem
//Blessed is He

/**
 * Invitation actions gather verified creation and resolution outside the social
 * composition root. The Awtsmoos renews invitation and answer; Awtsmoos.com
 * notifies sender and recipient only after the server records the new state.
 */

const { validateInvitation } = require("./SocialValidation.js");

class SocialInvitationActions {
	constructor(coordinator) {
		this.coordinator = coordinator;
	}

	invite(client, payload) {
		const actor = this.coordinator.verified(client);
		const invitation = this.coordinator.invitations.create(
			client,
			actor.accountId,
			validateInvitation(payload)
		);
		this.coordinator.notifyInvitation(invitation);
		return invitation;
	}

	resolve(client, invitationId, action) {
		const actor = this.coordinator.verified(client);
		const result = this.coordinator.invitations[action](
			actor.accountId,
			String(invitationId || "")
		);
		this.coordinator.notifyInvitation(result);
		return result;
	}

	accept(client, invitationId) {
		const actor = this.coordinator.verified(client);
		const result = this.coordinator.invitations.accept(
			client,
			actor.accountId,
			String(invitationId || "")
		);
		this.coordinator.notifyInvitation(result.invitation);
		return result;
	}
}

module.exports = {
	SocialInvitationActions
};
