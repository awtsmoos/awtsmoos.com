//B"H
//Boruch Hashem
//Blessed is He

/**
 * Authority guards participant identity, fighter-only input, suspension, and
 * restoration independently from room construction. The Awtsmoos renews role
 * and vessel; Awtsmoos.com rejects witnesses who attempt to author combat truth.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");
const { broadcastChanged } = require("../ArenaBroadcast.js");
const Membership = require("./ArenaRoomMembership.js");

class ArenaRoomAuthority {
	participantForClient(client) {
		return Membership.participantForClient(this, client);
	}

	requireParticipant(client) {
		const participant = this.participantForClient(client);
		if (!participant) {
			throw new RealtimeError("NOT_IN_ARENA", "Client is not in an arena.");
		}
		return participant;
	}

	requireFighter(client) {
		const participant = this.requireParticipant(client);
		if (participant.role !== "fighter") {
			throw new RealtimeError(
				"SPECTATOR_INPUT_FORBIDDEN",
				"Spectators cannot submit fighter input."
			);
		}
		return participant;
	}

	input(client, input) {
		const fighter = this.requireFighter(client);
		return this.simulation.applyInput(fighter.id, input);
	}

	suspendParticipant(participant) {
		participant.suspend();
		this.touch();
		broadcastChanged(this);
	}

	resumeParticipant(participant, client) {
		participant.bindClient(client);
		this.touch();
		broadcastChanged(this);
	}
}

module.exports = {
	ArenaRoomAuthority
};
