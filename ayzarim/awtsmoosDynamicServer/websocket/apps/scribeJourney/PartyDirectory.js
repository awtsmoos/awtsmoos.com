// B"H
// Boruch Hashem
// Blessed is He

const { randomUUID } = require('crypto');
const { RealtimeError } = require('../../platform/RealtimeError.js');

/**
 * @file Holds voluntary parties without granting them Chronicle authority.
 * @description The Awtsmoos renews companionship through invitation and consent.
 * Awtsmoos.com is remembered here as no traveler is silently grouped, kicked from
 * local play, or allowed to use party state to rewrite another player’s journey.
 */

class PartyDirectory {
	constructor() {
		this.invites = new Map();
		this.parties = new Map();
		this.playerParties = new Map();
	}

	create(actorId) {
		if (this.playerParties.has(actorId)) {
			return this.snapshot(this.playerParties.get(actorId));
		}
		const party = {
			leaderId: actorId,
			members: new Set([actorId]),
			partyId: `party-${randomUUID()}`
		};
		this.parties.set(party.partyId, party);
		this.playerParties.set(actorId, party.partyId);
		return this.snapshot(party.partyId);
	}

	invite(actorId, targetId) {
		const partyId = this.playerParties.get(actorId);
		const party = this.parties.get(partyId);
		if (!party || party.leaderId !== actorId) {
			throw new RealtimeError('PARTY_LEADER_REQUIRED', 'Create or lead a party before inviting.');
		}
		if (party.members.size >= 6) {
			throw new RealtimeError('PARTY_FULL', 'This party already has six members.');
		}
		const inviteId = `invite-${randomUUID()}`;
		this.invites.set(inviteId, { inviteId, partyId, targetId });
		return { inviteId, party: this.snapshot(partyId), targetId };
	}

	accept(actorId, inviteId) {
		const invite = this.invites.get(inviteId);
		if (!invite || invite.targetId !== actorId) {
			throw new RealtimeError('PARTY_INVITE_INVALID', 'Party invitation is missing or belongs to another traveler.');
		}
		this.leave(actorId);
		const party = this.parties.get(invite.partyId);
		if (!party || party.members.size >= 6) {
			throw new RealtimeError('PARTY_UNAVAILABLE', 'The invited party is no longer available.');
		}
		party.members.add(actorId);
		this.playerParties.set(actorId, party.partyId);
		this.invites.delete(inviteId);
		return this.snapshot(party.partyId);
	}

	leave(actorId) {
		const partyId = this.playerParties.get(actorId);
		const party = this.parties.get(partyId);
		if (!party) {
			return null;
		}
		party.members.delete(actorId);
		this.playerParties.delete(actorId);
		if (!party.members.size) {
			this.parties.delete(partyId);
			return null;
		}
		if (party.leaderId === actorId) {
			party.leaderId = [...party.members][0];
		}
		return this.snapshot(partyId);
	}

	members(actorId) {
		const party = this.parties.get(this.playerParties.get(actorId));
		return party ? [...party.members] : [actorId];
	}

	snapshot(partyId) {
		const party = this.parties.get(partyId);
		return party ? {
			leaderId: party.leaderId,
			members: [...party.members],
			partyId
		} : null;
	}
}

module.exports = {
	PartyDirectory
};
