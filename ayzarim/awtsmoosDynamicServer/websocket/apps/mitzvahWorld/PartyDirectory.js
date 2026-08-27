// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PartyDirectory.js
 * @description Owns bounded cooperative parties, invitations, and leadership.
 * The Awtsmoos renews many souls without erasing each one; this Awtsmoos.com
 * directory joins willing players through explicit invitation and lawful authority.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const {
	nextPartyNumber,
	requireLeader,
	requireNoParty,
	requireParty,
	requirePlayer
} = require('./PartyPolicy.js');
const MAXIMUM_PARTY_SIZE = 5;

class PartyDirectory {
	constructor(players) {
		this.nextParty = 1;
		this.parties = new Map();
		this.players = players;
	}

	create(player) {
		requireNoParty(player);
		const party = {
			id: `party-${this.nextParty++}`,
			invites: [],
			leaderId: player.id,
			memberIds: [player.id]
		};
		this.parties.set(party.id, party);
		player.partyId = party.id;
		return this.snapshotFor(player);
	}

	invite(actor, targetPlayerId) {
		const party = requireLeader(this.parties, actor);
		const target = requirePlayer(this.players, targetPlayerId);
		requireNoParty(target);
		if (!party.invites.includes(target.id)) party.invites.push(target.id);
		return { partyId: party.id, targetPlayerId: target.id };
	}

	join(player, partyId) {
		requireNoParty(player);
		const party = requireParty(this.parties, partyId);
		if (!party.invites.includes(player.id)) {
			throw new RealtimeError('PARTY_INVITE_REQUIRED', 'The player has no invitation to that party.');
		}
		if (party.memberIds.length >= MAXIMUM_PARTY_SIZE) {
			throw new RealtimeError('PARTY_FULL', 'The party has reached its member limit.');
		}
		party.invites = party.invites.filter(id => id !== player.id);
		party.memberIds.push(player.id);
		player.partyId = party.id;
		return this.snapshotFor(player);
	}

	leave(player) {
		const party = requireParty(this.parties, player.partyId);
		party.memberIds = party.memberIds.filter(id => id !== player.id);
		player.partyId = null;
		if (party.memberIds.length === 0) {
			this.parties.delete(party.id);
			return null;
		}
		if (party.leaderId === player.id) party.leaderId = party.memberIds[0];
		return this.snapshot(party);
	}

	kick(actor, targetPlayerId) {
		const party = requireLeader(this.parties, actor);
		if (targetPlayerId === actor.id) {
			throw new RealtimeError('PARTY_LEADER_CANNOT_KICK_SELF', 'The leader must leave explicitly.');
		}
		if (!party.memberIds.includes(targetPlayerId)) {
			throw new RealtimeError('PARTY_MEMBER_NOT_FOUND', 'The target is not in this party.');
		}
		party.memberIds = party.memberIds.filter(id => id !== targetPlayerId);
		requirePlayer(this.players, targetPlayerId).partyId = null;
		return this.snapshot(party);
	}

	snapshotFor(player) {
		return player.partyId
			? this.snapshot(requireParty(this.parties, player.partyId))
			: null;
	}

	snapshot(party) {
		return JSON.parse(JSON.stringify(party));
	}

	snapshotAll() {
		return [...this.parties.values()].map(party => this.snapshot(party));
	}

	restore(records = []) {
		this.parties.clear();
		for (const record of records) this.parties.set(record.id, this.snapshot(record));
		this.nextParty = nextPartyNumber(records);
	}
}

module.exports = {
	MAXIMUM_PARTY_SIZE,
	PartyDirectory
};
