//B"H
//Boruch Hashem
//Blessed is He

/**
 * A room gathers bounded roles around one authoritative simulation. The
 * Awtsmoos renews fighter, witness, bot, interruption, and return; Awtsmoos.com
 * keeps those lives synchronized without touching any neighboring socket world.
 */

const { randomUUID } = require("node:crypto");
const { RealtimeError } = require("../../platform/RealtimeError.js");
const { BotDirector } = require("./bots/BotDirector.js");
const { ArenaSimulation, TICK_RATE } = require("./ArenaSimulation.js");
const { broadcastChanged, broadcastState } = require("./ArenaBroadcast.js");
const Membership = require("./arena/ArenaRoomMembership.js");

class ArenaRoom {
	constructor(joinCode, ownerClient, ownerName, settings) {
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
		for (const bot of this.botDirector.createBots(settings.botCount, 1)) {
			this.simulation.add(bot);
		}
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

	input(client, input) {
		const fighter = this.requireFighter(client);
		return this.simulation.applyInput(fighter.id, input);
	}

	tick() {
		this.botDirector.applyInputs(this.simulation);
		const state = this.simulation.step();
		if (state.frame % 2 === 0 || state.phase === "finished") {
			broadcastState(this, state);
		}
	}

	startTimer() {
		this.timer = setInterval(() => this.tick(), 1000 / TICK_RATE);
		this.timer.unref?.();
	}

	close() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
		this.botDirector.clear();
	}

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
			throw new RealtimeError("SPECTATOR_INPUT_FORBIDDEN", "Spectators cannot submit fighter input.");
		}
		return participant;
	}

	clients() {
		return [...this.fighters, ...this.spectators]
			.filter((participant) => participant.connected && participant.client)
			.map((participant) => participant.client);
	}

	humanFighterCount() {
		return this.fighters.filter((fighter) => !fighter.isBot).length;
	}

	botCount() {
		return this.fighters.filter((fighter) => fighter.isBot).length;
	}

	owner() {
		return Membership.owner(this);
	}

	joinableRoles() {
		return Membership.joinableRoles(this);
	}

	isEmpty() {
		return this.humanFighterCount() === 0 && this.spectators.length === 0;
	}

	snapshot() {
		return {
			createdAt: this.createdAt,
			id: this.id,
			joinCode: this.joinCode,
			revision: this.revision,
			settings: this.settings,
			spectators: this.spectators.map((spectator) => spectator.snapshot()),
			state: this.simulation.snapshot()
		};
	}

	touch() {
		this.lastActivityAt = Date.now();
		this.revision += 1;
	}
}

module.exports = {
	ArenaRoom
};
