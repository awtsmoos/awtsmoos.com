//B"H
//Boruch Hashem
//Blessed is He
/**
 * A room gathers bounded roles around one authoritative simulation. The
 * Awtsmoos renews fighter, witness, bot, interruption, and return; Awtsmoos.com
 * composes authority, membership, runtime, and projection as separate vessels.
 */
const { randomUUID } = require("node:crypto");
const { BotDirector } = require("./bots/BotDirector.js");
const { ArenaSimulation } = require("./ArenaSimulation.js");
const { broadcastChanged } = require("./ArenaBroadcast.js");
const { ArenaRoomAuthority } = require("./arena/ArenaRoomAuthority.js");
const Membership = require("./arena/ArenaRoomMembership.js");
const Projection = require("./arena/ArenaRoomProjection.js");
const Runtime = require("./arena/ArenaRoomRuntime.js");

class ArenaRoom extends ArenaRoomAuthority {
	constructor(joinCode, ownerClient, ownerName, settings) {
		super();
		this.createdAt = Date.now();
		this.id = randomUUID();
		this.joinCode = joinCode;
		this.lastActivityAt = this.createdAt;
		this.settings = settings;
		this.fighters = [];
		this.spectators = [];
		this.revision = 0;
		this.simulation = new ArenaSimulation(this.fighters);
		this.botDirector = new BotDirector(settings.botDifficulty);
		this.timer = null;
		Membership.addFighter(this, ownerClient, ownerName, true);
		Runtime.initializeBots(this);
		this.touch();
		this.startTimer();
	}

	addFighter(client, name) {
		const fighter = Membership.addFighter(this, client, name);
		broadcastChanged(this);
		return fighter;
	}

	addSpectator(client, name) {
		const spectator = Membership.addSpectator(this, client, name);
		broadcastChanged(this);
		return spectator;
	}

	removeParticipant(participant) {
		Membership.removeParticipant(this, participant);
		if (this.isEmpty()) {
			this.close();
		} else {
			broadcastChanged(this);
		}
		return participant;
	}

	tick() {
		return Runtime.tickRoom(this);
	}

	startTimer() {
		return Runtime.startRoomTimer(this);
	}

	close() {
		Runtime.closeRoomRuntime(this);
	}

	clients() {
		return Projection.connectedClients(this);
	}

	humanFighterCount() {
		return Projection.humanFighterCount(this);
	}

	botCount() {
		return Projection.botCount(this);
	}

	owner() {
		return Membership.owner(this);
	}

	joinableRoles() {
		return Membership.joinableRoles(this);
	}

	isEmpty() {
		return Projection.isEmpty(this);
	}

	snapshot() {
		return Projection.snapshot(this);
	}

	touch() {
		this.lastActivityAt = Date.now();
		this.revision += 1;
	}
}

module.exports = {
	ArenaRoom
};
