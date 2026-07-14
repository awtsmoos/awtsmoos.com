//B"H
//Boruch Hashem
//Blessed is He

/**
 * A match is a deterministic ordering of server-owned steps, not a mirrored browser
 * illusion. The Awtsmoos renews each frame; Awtsmoos.com assigns identity, records
 * bounded history, seals public state, and preserves fighters across socket renewal.
 */

const { randomUUID } = require('node:crypto');
const Connection = require('./MatchConnectionState.js');
const { MatchFighter } = require('./MatchFighter.js');
const { MatchJournal } = require('./MatchJournal.js');
const { createMatchSnapshot } = require('./MatchSnapshot.js');
const { stepMatch } = require('./MatchStep.js');
const { TICK_RATE } = require('./SefiraLimits.js');
const COUNTDOWN_FRAMES = TICK_RATE * 3;

/** Owns one fixed-step authoritative arena and its resumable public history. */
class MatchSimulation {
	constructor(players, rules) {
		this.countdownFrames = COUNTDOWN_FRAMES;
		this.finishedAt = null;
		this.frame = 0;
		this.matchId = randomUUID();
		this.phase = 'countdown';
		this.rules = rules;
		this.schemaVersion = 2;
		this.startedAt = Date.now();
		this.tickRate = TICK_RATE;
		this.timeFrames = rules.timerSeconds * TICK_RATE;
		this.winner = null;
		this.fighters = players.map((player, index) => new MatchFighter(player, index, rules));
		this.journal = new MatchJournal(this.matchId);
		this.lastSnapshot = this.commitSnapshot(true);
		this.journal.recordEvent(0, 'created', { rules });
	}

	applyInput(playerId, input) {
		const fighter = this.findFighter(playerId);
		if (!fighter) {
			return false;
		}
		const accepted = fighter.acceptInput(input);
		if (accepted) {
			this.journal.recordEvent(this.frame, 'input', { input, playerId });
		}
		return accepted;
	}

	recordRejectedInput(playerId) {
		this.findFighter(playerId)?.recordRejectedInput();
	}

	suspend(playerId) {
		return Connection.suspendFighter(this, playerId);
	}

	resume(playerId) {
		return Connection.resumeFighter(this, playerId);
	}

	disconnect(playerId) {
		return Connection.disconnectFighter(this, playerId);
	}

	step() {
		return stepMatch(this);
	}

	snapshot() {
		return createMatchSnapshot(this);
	}

	commitSnapshot(force = false) {
		const snapshot = this.snapshot();
		this.lastSnapshot = snapshot;
		this.journal.recordSnapshot(snapshot, force);
		return snapshot;
	}

	currentSnapshot() {
		return this.lastSnapshot || this.snapshot();
	}

	replay() {
		return this.journal.export(this.currentSnapshot());
	}

	findFighter(playerId) {
		return this.fighters.find(candidate => candidate.id === playerId) || null;
	}
}

module.exports = {
	COUNTDOWN_FRAMES,
	MatchSimulation,
	TICK_RATE
};
