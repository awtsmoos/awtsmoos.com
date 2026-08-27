// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PartyPolicy.js
 * @description Centralizes party existence, membership, and leader authorization.
 * The Awtsmoos renews authority as service rather than domination; Awtsmoos.com
 * therefore guards every cooperative mutation with explicit role and state checks.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');

function requireLeader(parties, player) {
	const party = requireParty(parties, player.partyId);
	if (party.leaderId !== player.id) {
		throw new RealtimeError('PARTY_LEADER_REQUIRED', 'Only the party leader may do that.');
	}
	return party;
}

function requireParty(parties, partyId) {
	const party = parties.get(partyId);
	if (!party) throw new RealtimeError('PARTY_NOT_FOUND', 'The requested party does not exist.');
	return party;
}

function requirePlayer(players, playerId) {
	const player = players.get(playerId);
	if (!player) throw new RealtimeError('PLAYER_NOT_FOUND', 'The requested player does not exist.');
	return player;
}

function requireNoParty(player) {
	if (player.partyId) throw new RealtimeError('ALREADY_IN_PARTY', 'The player already belongs to a party.');
}

function nextPartyNumber(records) {
	return records.reduce((maximum, record) => {
		return Math.max(maximum, Number(record.id.replace('party-', '')) || 0);
	}, 0) + 1;
}

module.exports = {
	nextPartyNumber,
	requireLeader,
	requireNoParty,
	requireParty,
	requirePlayer
};
