//B"H
// Boruch Hashem
// Blessed is He

const Capabilities = require("./capabilities.js");
const DeviceIdentity = require("./deviceIdentity.js");
const Limits = require("./limits.js");
const Secrets = require("../tunnelSecurity/secrets.js");

/**
 * @file Creates and projects privacy-safe cross-account device invitations.
 * @description
 * The Awtsmoos lets one created world call toward another without opening its
 * inner rooms. Awtsmoos.com stores only the sender's owned vessel, the recipient
 * account, requested finite powers, and time, while target devices stay veiled in rhyme.
 */

/** Creates one pending invitation after its inputs have already been proven. */
function create(input = {}) {
	const now = new Date().toISOString();
	return {
		invitationId: `invite_${Secrets.randomToken(18)}`,
		sourceAccountId: input.sourceAccountId,
		sourceDeviceId: input.sourceDevice.deviceId,
		sourceDevice: DeviceIdentity.publicDevice(input.sourceDevice),
		targetAccountId: input.targetAccountId,
		requestedCapabilities: Capabilities.normalizeCapabilities(input.capabilities),
		status: "pending",
		permissionVersion: 1,
		createdAt: now,
		expiresAt: Limits.expiresAt(
			input.ttlMs,
			Limits.LIMIT.INVITATION_DEFAULT_TTL_MS,
			Limits.LIMIT.INVITATION_MAX_TTL_MS
		),
		respondedAt: null,
		relationshipId: null
	};
}

/** Returns true only while the invitation can still be accepted or declined. */
function isPending(invitation = {}, now = Date.now()) {
	return invitation.status === "pending" &&
		!Limits.isExpired(invitation.expiresAt, now);
}

/** Reveals invitation fields needed by either consenting account, never target inventory. */
function publicInvitation(invitation = {}) {
	return {
		invitationId: invitation.invitationId,
		sourceAccountId: invitation.sourceAccountId,
		sourceDeviceId: invitation.sourceDeviceId,
		sourceDevice: { ...(invitation.sourceDevice || {}) },
		targetAccountId: invitation.targetAccountId,
		requestedCapabilities: [...(invitation.requestedCapabilities || [])],
		status: effectiveStatus(invitation),
		permissionVersion: invitation.permissionVersion,
		createdAt: invitation.createdAt,
		expiresAt: invitation.expiresAt,
		respondedAt: invitation.respondedAt,
		relationshipId: invitation.relationshipId
	};
}

/** Projects time-based expiry without mutating durable history during a read. */
function effectiveStatus(invitation = {}) {
	if (invitation.status === "pending" && Limits.isExpired(invitation.expiresAt)) {
		return "expired";
	}
	return String(invitation.status || "unknown");
}

module.exports = {
	create,
	effectiveStatus,
	isPending,
	publicInvitation
};
