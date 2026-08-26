//B"H
// Boruch Hashem
// Blessed is He

const { mutateStore, readStore } = require("../store.js");
const Audit = require("./protocolAudit.js");
const Capabilities = require("./capabilities.js");
const Limits = require("./limits.js");
const Record = require("./relationshipRecord.js");

/**
 * @file Resolves, lists, revokes, and bounds directional device covenants.
 * @description
 * The Awtsmoos recreates permission every instant; Awtsmoos.com mirrors that truth
 * by checking expiry and revocation on each use rather than trusting stale sessions.
 * Either human side may close the finite relationship immediately while worlds rhyme.
 */

/** Finds one active sender-owned relationship carrying the requested capability. */
function authorize(accountId, relationshipId, capability, store = readStore()) {
	const relationship = store.deviceProtocolRelationships?.[relationshipId];
	const sourceMatches = relationship?.sourceAccountId === accountId;
	const capabilityMatches = Capabilities.includesCapability(relationship, capability);
	return Record.isActive(relationship) && sourceMatches && capabilityMatches
		? relationship
		: null;
}

/** Lists relationships where the account is either consenting side. */
function forAccount(accountId, store = readStore()) {
	return Object.values(store.deviceProtocolRelationships || {})
		.filter(item =>
			item.sourceAccountId === accountId ||
			item.targetAccountId === accountId
		)
		.map(Record.publicRelationship);
}

/** Revokes a relationship when either participating account requests it. */
function revoke(accountId, relationshipId) {
	let result = null;
	mutateStore(store => {
		const relationship = store.deviceProtocolRelationships?.[relationshipId];
		const participant = relationship && [
			relationship.sourceAccountId,
			relationship.targetAccountId
		].includes(accountId);
		if (!participant) {
			return store;
		}
		if (!relationship.revokedAt) {
			relationship.revokedAt = new Date().toISOString();
			relationship.permissionVersion = Number(relationship.permissionVersion || 1) + 1;
		}
		Audit.appendAudit(store, {
			action: "device.relationship.revoke",
			accountId,
			relationshipId,
			sourceDeviceId: relationship.sourceDeviceId,
			targetDeviceId: relationship.targetDeviceId,
			result: "allowed"
		});
		result = Record.publicRelationship(relationship);
		return store;
	});
	return result;
}

/** Prunes terminal records and reports whether one more relationship may be added. */
function capacityAvailable(store) {
	prune(store);
	return Object.keys(store.deviceProtocolRelationships || {}).length <
		Limits.LIMIT.MAX_RELATIONSHIPS;
}

/** Removes oldest terminal relationships only when the global ceiling is reached. */
function prune(store) {
	const entries = Object.values(store.deviceProtocolRelationships || {});
	if (entries.length < Limits.LIMIT.MAX_RELATIONSHIPS) {
		return;
	}
	entries
		.filter(item => !Record.isActive(item))
		.sort((left, right) => String(left.createdAt).localeCompare(String(right.createdAt)))
		.slice(0, Math.max(1, entries.length - Limits.LIMIT.MAX_RELATIONSHIPS + 1))
		.forEach(item => {
			delete store.deviceProtocolRelationships[item.relationshipId];
		});
}

module.exports = {
	authorize,
	capacityAvailable,
	forAccount,
	prune,
	revoke
};
