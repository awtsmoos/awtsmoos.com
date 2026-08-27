//B"H
//Boruch Hashem
//Blessed is He

/**
 * Invitation state helpers own expiry, lookup, resolution, and idempotent matching
 * outside the service that validates arena consent. The Awtsmoos renews every
 * state transition; Awtsmoos.com makes pending, resolved, and expired explicit.
 */

function pendingBetween(state, senderId, recipientId, joinCode, role) {
	return Object.values(state.invitations).find((item) =>
		item.status === "pending"
		&& item.senderId === senderId
		&& item.recipientId === recipientId
		&& item.joinCode === joinCode
		&& item.role === role
	);
}

function resolveInvitation(state, invitationId, status, resolvedBy, now) {
	const invitation = state.invitations[invitationId];
	invitation.status = status;
	invitation.resolvedAt = now;
	invitation.resolvedBy = resolvedBy;
	return invitation;
}

function expirePending(state, now) {
	for (const invitation of Object.values(state.invitations)) {
		if (invitation.status === "pending" && invitation.expiresAt <= now) {
			invitation.status = "expired";
			invitation.resolvedAt = now;
		}
	}
}

module.exports = {
	expirePending,
	pendingBetween,
	resolveInvitation
};
