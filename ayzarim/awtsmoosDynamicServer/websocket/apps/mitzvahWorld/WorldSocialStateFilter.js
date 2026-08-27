// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Removes orphaned party, instance, and guild references during restoration.
 * @description The Awtsmoos renews every bond only where its members survive.
 * Awtsmoos.com refuses to resurrect social vessels whose players no longer possess
 * sessions, while preserving lawful leadership and persistent community identity.
 */

function sanitizeSocialState(roomRecord, survivingPlayerIds) {
	const parties = (roomRecord.parties || [])
		.map((party) => sanitizeParty(party, survivingPlayerIds))
		.filter(Boolean);
	const instances = (roomRecord.instances || [])
		.map((instance) => sanitizeInstance(instance, survivingPlayerIds))
		.filter(Boolean);
	const guilds = (roomRecord.guilds || [])
		.map((guild) => sanitizeGuild(guild, survivingPlayerIds))
		.filter(Boolean);
	const partyIds = new Set(parties.map((party) => party.id));
	const instanceIds = new Set(instances.map((instance) => instance.id));
	const guildIds = new Set(guilds.map((guild) => guild.id));
	return {
		guilds,
		instances,
		parties,
		players: (roomRecord.players || []).map((player) => ({
			...clone(player),
			guildId: guildIds.has(player.guildId) ? player.guildId : null,
			instanceId: instanceIds.has(player.instanceId) ? player.instanceId : null,
			partyId: partyIds.has(player.partyId) ? player.partyId : null
		}))
	};
}

function sanitizeParty(record, survivingPlayerIds) {
	const memberIds = unique(record.memberIds).filter((id) => survivingPlayerIds.has(id));
	if (!memberIds.length) {
		return null;
	}
	return {
		...clone(record),
		invites: unique(record.invites).filter((id) => survivingPlayerIds.has(id)),
		leaderId: memberIds.includes(record.leaderId) ? record.leaderId : memberIds[0],
		memberIds
	};
}

function sanitizeInstance(record, survivingPlayerIds) {
	const memberIds = unique(record.memberIds).filter((id) => survivingPlayerIds.has(id));
	return memberIds.length ? { ...clone(record), memberIds } : null;
}

function sanitizeGuild(record, survivingPlayerIds) {
	const memberIds = unique(record.memberIds).filter((id) => survivingPlayerIds.has(id));
	if (!memberIds.length) {
		return null;
	}
	return {
		...clone(record),
		invites: unique(record.invites).filter((id) => survivingPlayerIds.has(id)),
		leaderId: memberIds.includes(record.leaderId) ? record.leaderId : memberIds[0],
		memberIds
	};
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
