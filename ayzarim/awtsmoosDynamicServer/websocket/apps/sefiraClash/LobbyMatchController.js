//B"H
//Boruch Hashem
//Blessed is He

/**
 * Lobby agreement becomes a living match through one lifecycle steward. The
 * Awtsmoos renews every tick; Awtsmoos.com preserves original match methods
 * while additive continuity methods arrive through one focused installer.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { broadcastMatch } = require('./MatchBroadcast.js');
const { installMatchContinuity } = require('./LobbyMatchContinuity.js');
const { MatchSimulation, TICK_RATE } = require('./MatchSimulation.js');

class LobbyMatchController {
	constructor(room) {
		this.room = room;
		this.simulation = null;
		this.timer = null;
		installMatchContinuity(this);
	}

	start(client) {
		this.room.requireOwner(client);
		this.room.requireStartable();
		this.stopTimer();
		this.simulation = new MatchSimulation(this.room.players, this.room.rules);
		this.timer = setInterval(() => {
			this.tick();
		}, 1000 / TICK_RATE);
		this.timer.unref?.();
		const snapshot = this.simulation.snapshot();
		broadcastMatch(this.room, snapshot);
		return snapshot;
	}

	input(client, input) {
		const member = this.room.requireMember(client);
		if (!this.simulation || this.simulation.phase === 'finished') {
			throw new RealtimeError('MATCH_NOT_ACTIVE', 'No active match accepts input.');
		}
		return this.simulation.applyInput(member.id, input);
	}

	rematch(client) {
		this.room.requireOwner(client);
		if (!this.simulation || this.simulation.phase !== 'finished') {
			throw new RealtimeError('MATCH_NOT_FINISHED', 'Rematch requires a finished match.');
		}
		this.stopTimer();
		this.simulation = null;
		for (const player of this.room.players) {
			player.ready = false;
		}
		this.room.touch();
		return this.room.snapshot();
	}

	disconnect(playerId) {
		if (!this.simulation) {
			return;
		}
		this.simulation.disconnect(playerId);
		broadcastMatch(this.room, this.simulation.snapshot());
		if (this.simulation.phase === 'finished') {
			this.stopTimer();
		}
	}

	tick() {
		if (!this.simulation) {
			return;
		}
		const snapshot = this.simulation.step();
		if (snapshot.frame % 2 === 0 || snapshot.phase === 'finished') {
			broadcastMatch(this.room, snapshot);
		}
		if (snapshot.phase === 'finished') {
			this.stopTimer();
		}
	}

	summary() {
		if (!this.simulation) {
			return { phase: 'lobby' };
		}
		return {
			frame: this.simulation.frame,
			phase: this.simulation.phase,
			winner: this.simulation.winner
		};
	}

	stopTimer() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}
}

module.exports = {
	LobbyMatchController
};
