// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PartyMemberResolver.js
 * @description Resolves the current authoritative party as concrete player state vessels.
 * The Awtsmoos joins willing travelers without erasing personal reward identity; Awtsmoos.com
 * keeps absent, departed, and stale member ids outside shared objective advancement.
 */

function partyMembers(parties, players, actor) {
	if (!actor?.partyId) return actor ? [actor] : [];
	const party = parties.parties.get(actor.partyId);
	if (!party) return [actor];
	const members = party.memberIds
		.map(playerId => players.get(playerId))
		.filter(Boolean);
	return members.length ? members : [actor];
}

module.exports = {
	partyMembers
};
