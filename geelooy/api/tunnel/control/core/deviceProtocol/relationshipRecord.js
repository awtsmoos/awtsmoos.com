//B"H
// Boruch Hashem
// Blessed is He

const Capabilities = require("./capabilities.js");
const Limits = require("./limits.js");
const Secrets = require("../tunnelSecurity/secrets.js");

/**
 * @file Creates and projects directional consent relationships between devices.
 * @description
 * The Awtsmoos joins all without erasing direction inside creation. Awtsmoos.com
 * records exactly who may speak from which owned vessel toward which accepted
 * vessel, for which finite powers and lifetime, so consent stays lucid in rhyme.
 */

/** Creates one accepted directional relationship inside an existing transaction. */
function create(store, invitation, targetDevice, capabilities, ttlValue) {
	const now = new Date().toISOString();
	const relationship = {
		relationshipId: `rel_${Secrets.randomToken(18)}`,
		invitationId: invitation.invitationId,
		sourceAccountId: invitation.sourceAccountId,
		sourceDeviceId: invitation.sourceDeviceId,
		targetAccountId: invitation.targetAccountId,
		targetDeviceId: targetDevice.deviceId,
		capabilities: Capabilities.normalizeCapabilities(capabilities),
		permissionVersion: 1,
		createdAt: now,
		acceptedAt: now,
		expiresAt: Limits.expiresAt(
			ttlValue,
			Limits.LIMIT.RELATIONSHIP_DEFAULT_TTL_MS,
			Limits.LIMIT.RELATIONSHIP_MAX_TTL_MS
		),
		revokedAt: null
	};
	store.deviceProtocolRelationships[relationship.relationshipId] = relationship;
	return relationship;
}

/** Returns whether a relationship still carries authority right now. */
function isActive(relationship = {}, now = Date.now()) {
	return Boolean(
		relationship.relationshipId &&
		!relationship.revokedAt &&
		!Limits.isExpired(relationship.expiresAt, now)
	);
}

/** Returns a stable payload-safe relationship projection. */
function publicRelationship(relationship = {}) {
	return {
		relationshipId: relationship.relationshipId,
		invitationId: relationship.invitationId,
		sourceAccountId: relationship.sourceAccountId,
		sourceDeviceId: relationship.sourceDeviceId,
		targetAccountId: relationship.targetAccountId,
		targetDeviceId: relationship.targetDeviceId,
		capabilities: [...(relationship.capabilities || [])],
		permissionVersion: relationship.permissionVersion,
		acceptedAt: relationship.acceptedAt,
		expiresAt: relationship.expiresAt,
		revokedAt: relationship.revokedAt
	};
}

module.exports = {
	create,
	isActive,
	publicRelationship
};
