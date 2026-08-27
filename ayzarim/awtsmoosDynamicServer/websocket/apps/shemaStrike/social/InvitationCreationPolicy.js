//B"H
//Boruch Hashem
//Blessed is He

/**
 * Invitation creation policy validates present arena truth and constructs one
 * immutable pending record. The Awtsmoos renews sender, recipient, room, and
 * consent; Awtsmoos.com refuses an invitation that bypasses occupancy or capacity.
 */

const { randomUUID } = require("node:crypto");
const { RealtimeError } = require("../../../platform/RealtimeError.js");

class InvitationCreationPolicy {
	constructor(privacy, lifetimeMs, now = Date.now) {
		this.privacy = privacy;
		this.lifetimeMs = lifetimeMs;
		this.now = now;
	}

	requireAllowed(session, senderId, data) {
		if (session.room.joinCode !== data.joinCode) {
			throw new RealtimeError(
				"INVITATION_ROOM_FORBIDDEN",
				"Invite only from the arena you occupy."
			);
		}
		if (!this.privacy.canInvite(senderId, data.recipientId)) {
			throw new RealtimeError(
				"INVITATION_PRIVACY_DENIED",
				"Recipient privacy or blocking denies invitations."
			);
		}
		if (!session.room.joinableRoles().includes(data.role)) {
			throw new RealtimeError(
				"INVITATION_ROLE_UNAVAILABLE",
				"Requested arena role is unavailable."
			);
		}
	}

	createRecord(senderId, data) {
		const createdAt = this.now();
		return {
			createdAt,
			expiresAt: createdAt + this.lifetimeMs,
			id: randomUUID(),
			joinCode: data.joinCode,
			message: data.message,
			recipientId: data.recipientId,
			role: data.role,
			senderId,
			status: "pending"
		};
	}
}

module.exports = {
	InvitationCreationPolicy
};
