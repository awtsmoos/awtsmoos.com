//B"H
//Boruch Hashem
//Blessed is He
/**
 * Invitations are expiring server records, never links that bypass current
 * policy. The Awtsmoos renews consent at creation and acceptance; Awtsmoos.com
 * rechecks blocks, room life, capacity, role, and identity before admission.
 */
const { RealtimeError } = require("../../../platform/RealtimeError.js");
const { InvitationCreationPolicy } = require("./InvitationCreationPolicy.js");
const State = require("./InvitationState.js");
const INVITATION_LIFETIME_MS = 5 * 60 * 1000;

class InvitationService {
	constructor(repository, privacy, arenaDirectory, options = {}) {
		this.repository = repository;
		this.privacy = privacy;
		this.arenas = arenaDirectory;
		this.now = options.now || Date.now;
		this.creation = new InvitationCreationPolicy(
			privacy,
			INVITATION_LIFETIME_MS,
			this.now
		);
	}
	create(client, senderId, data) {
		const session = this.arenas.sessions.require(client);
		this.creation.requireAllowed(session, senderId, data);
		return this.repository.mutate((state) => {
			const existing = State.pendingBetween(
				state,
				senderId,
				data.recipientId,
				data.joinCode,
				data.role
			);
			if (existing) {
				return existing;
			}
			const invitation = this.creation.createRecord(senderId, data);
			state.invitations[invitation.id] = invitation;
			return invitation;
		});
	}
	accept(client, recipientId, invitationId) {
		const invitation = this.requirePending(recipientId, invitationId);
		if (!this.privacy.canInvite(invitation.senderId, recipientId)) {
			throw new RealtimeError(
				"INVITATION_PRIVACY_DENIED",
				"Invitation is no longer permitted."
			);
		}
		const profile = this.privacy.profile(recipientId);
		const membership = invitation.role === "fighter"
			? this.arenas.join(client, invitation.joinCode, profile.displayName)
			: this.arenas.spectate(client, invitation.joinCode, profile.displayName);
		this.resolve(invitationId, "accepted", recipientId);
		return {
			invitation: this.get(invitationId),
			membership
		};
	}
	decline(recipientId, invitationId) {
		this.requirePending(recipientId, invitationId);
		return this.resolve(invitationId, "declined", recipientId);
	}
	cancel(senderId, invitationId) {
		const invitation = this.get(invitationId);
		if (!invitation || invitation.senderId !== senderId || invitation.status !== "pending") {
			throw new RealtimeError(
				"INVITATION_CANCEL_FORBIDDEN",
				"Invitation cannot be cancelled by this account."
			);
		}
		return this.resolve(invitationId, "cancelled", senderId);
	}
	list(accountId) {
		this.expirePending();
		return this.repository.read((state) => ({
			incoming: Object.values(state.invitations)
				.filter((item) => item.recipientId === accountId),
			outgoing: Object.values(state.invitations)
				.filter((item) => item.senderId === accountId)
		}));
	}
	requirePending(recipientId, invitationId) {
		this.expirePending();
		const invitation = this.get(invitationId);
		if (!invitation || invitation.recipientId !== recipientId || invitation.status !== "pending") {
			throw new RealtimeError(
				"INVITATION_NOT_PENDING",
				"Invitation is missing, expired, or resolved."
			);
		}
		return invitation;
	}
	resolve(invitationId, status, resolvedBy) {
		return this.repository.mutate((state) => State.resolveInvitation(
			state,
			invitationId,
			status,
			resolvedBy,
			this.now()
		));
	}
	expirePending() {
		this.repository.mutate((state) => State.expirePending(state, this.now()));
	}
	get(invitationId) {
		return this.repository.read((state) => state.invitations[invitationId]) || null;
	}
}

module.exports = {
	INVITATION_LIFETIME_MS,
	InvitationService
};
