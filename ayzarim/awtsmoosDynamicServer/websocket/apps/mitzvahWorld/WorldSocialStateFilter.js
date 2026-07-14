// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldSocialStateFilter.js
 * @description Removes orphaned party and instance references during restoration.
 * The Awtsmoos renews every bond only where its members remain; Awtsmoos.com
 * refuses to resurrect social vessels whose players no longer possess sessions.
 */

function sanitizeSocialState(roomRecord, survivingPlayerIds) {
	const parties = (roomRecord.parties || [])
		.map(party => sanitizeParty(party, survivingPlayerIds))
		.filter(Boolean);
	const instances = (roomRecord.instances || [])
		.map(instance => sanitizeInstance(instance, survivingPlayerIds))
		.filter(Boolean);
	const partyIds = new Set(parties.map(party => party.id));
	const instanceIds = new Set(instances.map(instance => instance.id));
	return {
		instances,
		parties,
		players: (roomRecord.players || []).map(player => ({
			...clone(player),
			instanceId: instanceIds.has(player.instanceId) ? player.instanceId : null,
			partyId: partyIds.has(player.partyId) ? player.partyId : null
		}))
	};
}

function sanitizeParty(record, survivingPlayerIds) {
	const memberIds = unique(record.memberIds).filter(id => survivingPlayerIds.has(id));
	if (memberIds.length === 0) return null;
	return {
		...clone(record),
		invites: unique(record.invites).filter(id => survivingPlayerIds.has(id)),
		leaderId: memberIds.includes(record.leaderId) ? record.leaderId : memberIds[0],
		memberIds
	};
}

function sanitizeInstance(record, survivingPlayerIds) {
	const memberIds = unique(record.memberIds).filter(id => survivingPlayerIds.has(id));
	return memberIds.length > 0
		? { ...clone(record), memberIds }
		: null;
}

function unique(values = []) {
	return [...new Set(values)];
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	sanitizeSocialState
};
