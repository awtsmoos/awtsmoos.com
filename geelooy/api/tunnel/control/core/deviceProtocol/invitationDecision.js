//B"H
// Boruch Hashem
// Blessed is He

const { mutateStore } = require("../store.js");
const Audit = require("./protocolAudit.js");
const Capabilities = require("./capabilities.js");
const DeviceIdentity = require("./deviceIdentity.js");
const Invitation = require("./invitationRecord.js");
const Relationship = require("./relationshipRecord.js");
const RelationshipStore = require("./relationshipStore.js");

/**
 * @file Applies recipient-owned accept/decline and initiator cancellation decisions.
 * @description
 * The Awtsmoos gives another soul no consent by someone else's declaration alone.
 * Awtsmoos.com therefore lets the named recipient choose its own target vessel and
 * reduce requested powers, while unanswered knocks may be withdrawn cleanly in rhyme.
 */

function accept(accountId, input = {}) {
	return decide(accountId, input, "accepted");
}

function decline(accountId, input = {}) {
	return decide(accountId, input, "declined");
}

function cancel(accountId, invitationId) {
	let result = null;
	mutateStore(store => {
		const invitation = store.deviceProtocolInvitations?.[invitationId];
		if (!Invitation.isPending(invitation) || invitation.sourceAccountId !== accountId) {
			return store;
		}
		closeInvitation(invitation, "revoked");
		auditDecision(store, accountId, invitation, "cancel");
		result = Invitation.publicInvitation(invitation);
		return store;
	});
	return result;
}

function decide(accountId, input, decision) {
	let result = { ok: false, error: "device_protocol_invitation_not_found" };
	mutateStore(store => {
		const invitation = store.deviceProtocolInvitations?.[input.invitationId];
		if (!Invitation.isPending(invitation) || invitation.targetAccountId !== accountId) {
			return store;
		}
		if (decision === "declined") {
			closeInvitation(invitation, decision);
			auditDecision(store, accountId, invitation, decision);
			result = {
				ok: true,
				invitation: Invitation.publicInvitation(invitation)
			};
			return store;
		}
		result = acceptInside(store, accountId, input, invitation);
		return store;
	});
	return result;
}

function acceptInside(store, accountId, input, invitation) {
	const targetDevice = DeviceIdentity.ownedDevice(
		accountId,
		input.targetDeviceId,
		store
	);
	const capabilities = Capabilities.normalizeCapabilities(input.capabilities);
	const validSubset = Capabilities.isSubset(
		capabilities,
		invitation.requestedCapabilities
	);
	if (!targetDevice || !validSubset) {
		return { ok: false, error: "device_protocol_acceptance_invalid" };
	}
	if (!RelationshipStore.capacityAvailable(store)) {
		return { ok: false, error: "device_protocol_capacity_reached" };
	}
	const relationship = Relationship.create(
		store,
		invitation,
		targetDevice,
		capabilities,
		input.ttlMs
	);
	closeInvitation(invitation, "accepted");
	invitation.relationshipId = relationship.relationshipId;
	auditDecision(store, accountId, invitation, "accept", relationship.relationshipId);
	return {
		ok: true,
		invitation: Invitation.publicInvitation(invitation),
		relationship: Relationship.publicRelationship(relationship)
	};
}

function closeInvitation(invitation, status) {
	invitation.status = status;
	invitation.permissionVersion = Number(invitation.permissionVersion || 1) + 1;
	invitation.respondedAt = new Date().toISOString();
}

function auditDecision(store, accountId, invitation, action, relationshipId = "") {
	Audit.appendAudit(store, {
		action: `device.invitation.${action}`,
		accountId,
		invitationId: invitation.invitationId,
		relationshipId,
		sourceDeviceId: invitation.sourceDeviceId,
		result: "allowed"
	});
}

module.exports = { accept, cancel, decline };
