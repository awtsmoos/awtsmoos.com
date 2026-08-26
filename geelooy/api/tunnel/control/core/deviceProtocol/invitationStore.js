//B"H
// Boruch Hashem
// Blessed is He

const { mutateStore, readStore } = require("../store.js");
const Id = require("../tunnelSecurity/identifiers.js");
const Audit = require("./protocolAudit.js");
const Capabilities = require("./capabilities.js");
const DeviceIdentity = require("./deviceIdentity.js");
const Limits = require("./limits.js");
const Record = require("./invitationRecord.js");

/**
 * @file Creates and lists consent invitations without exposing foreign device inventory.
 * @description
 * The Awtsmoos lets one person knock without entering. Awtsmoos.com proves the
 * initiator owns the source device, records only the recipient account, and grants
 * no transport authority until a separate recipient-owned decision is made in rhyme.
 */

/** Creates a pending cross-account invitation or a stable denial result. */
function createInvitation(accountId, input = {}) {
	let result = { ok: false, error: "device_protocol_invitation_invalid" };
	mutateStore(store => {
		const targetAccountId = Id.accountId(input.targetAccountId);
		const sourceDevice = DeviceIdentity.ownedDevice(accountId, input.sourceDeviceId, store);
		const capabilityResult = Capabilities.validateCapabilities(input.capabilities);
		if (!targetAccountId || targetAccountId === accountId || !sourceDevice || !capabilityResult.ok) {
			return store;
		}
		prune(store);
		if (Object.keys(store.deviceProtocolInvitations).length >= Limits.LIMIT.MAX_INVITATIONS) {
			result = { ok: false, error: "device_protocol_capacity_reached" };
			return store;
		}
		const invitation = Record.create({
			sourceAccountId: accountId,
			sourceDevice,
			targetAccountId,
			capabilities: capabilityResult.capabilities,
			ttlMs: input.ttlMs
		});
		store.deviceProtocolInvitations[invitation.invitationId] = invitation;
		Audit.appendAudit(store, invitationAudit("create", accountId, invitation));
		result = { ok: true, invitation: Record.publicInvitation(invitation) };
		return store;
	});
	return result;
}

/** Lists incoming and outgoing invitations for one account with privacy-safe fields. */
function invitationsFor(accountId, store = readStore()) {
	const values = Object.values(store.deviceProtocolInvitations || {});
	return {
		incoming: values
			.filter(item => item.targetAccountId === accountId)
			.map(Record.publicInvitation),
		outgoing: values
			.filter(item => item.sourceAccountId === accountId)
			.map(Record.publicInvitation)
	};
}

/** Removes oldest terminal or expired invitations before a hard capacity refusal. */
function prune(store) {
	const entries = Object.values(store.deviceProtocolInvitations || {});
	if (entries.length < Limits.LIMIT.MAX_INVITATIONS) {
		return;
	}
	entries
		.filter(item => !Record.isPending(item))
		.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
		.slice(0, Math.max(1, entries.length - Limits.LIMIT.MAX_INVITATIONS + 1))
		.forEach(item => delete store.deviceProtocolInvitations[item.invitationId]);
}

function invitationAudit(action, accountId, invitation) {
	return {
		action: `device.invitation.${action}`,
		accountId,
		invitationId: invitation.invitationId,
		sourceDeviceId: invitation.sourceDeviceId,
		result: "allowed"
	};
}

module.exports = {
	createInvitation,
	invitationsFor,
	prune
};
