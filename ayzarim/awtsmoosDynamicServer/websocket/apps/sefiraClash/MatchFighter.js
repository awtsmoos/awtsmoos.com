//B"H
//Boruch Hashem
//Blessed is He

/**
 * One fighter is a server-owned soul of motion, damage, stocks, intention, and
 * measured history. The Awtsmoos recreates each state; Awtsmoos.com preserves
 * connection identity without exposing private transport or accepting client truth.
 */

const { characterProfile } = require('./CharacterProfiles.js');
const { neutralInput } = require('./MatchInput.js');
const { MatchStats } = require('./MatchStats.js');
const SPAWNS = [260, 480, 720, 940];

/** Owns authoritative mutable state for one resumable lobby player. */
class MatchFighter {
	constructor(player, index, rules) {
		this.characterId = player.characterId;
		this.connected = player.connected !== false;
		this.displayName = player.displayName;
		this.id = player.id;
		this.team = player.team;
		this.profile = characterProfile(player.characterId);
		this.spawnX = SPAWNS[index] || 600;
		this.stocks = rules.stocks;
		this.lastDamagedBy = null;
		this.lastInputSequence = 0;
		this.input = neutralInput();
		this.attackTargets = new Set();
		this.stats = new MatchStats();
		this.resetBody();
	}

	/** Accepts only a newer validated input packet and records the outcome. */
	acceptInput(input) {
		const accepted = input.sequence > this.lastInputSequence && this.connected;
		this.stats.recordInput(accepted);
		if (!accepted) {
			return false;
		}
		this.lastInputSequence = input.sequence;
		this.input = input;
		return true;
	}

	recordRejectedInput() {
		this.stats.recordInput(false);
	}

	suspend() {
		this.connected = false;
		this.input = neutralInput(this.lastInputSequence);
		this.attackHeld = false;
		this.guarding = false;
		this.jumpHeld = false;
	}

	resume() {
		this.connected = true;
	}

	/** Resets transient body state at spawn or respawn. */
	resetBody() {
		this.attackCooldown = 0;
		this.attackFrames = 0;
		this.attackHeld = false;
		this.damage = 0;
		this.eliminated = false;
		this.facing = 1;
		this.grounded = false;
		this.guarding = false;
		this.hitstun = 0;
		this.jumpHeld = false;
		this.respawnFrames = 0;
		this.vx = 0;
		this.vy = 0;
		this.x = this.spawnX;
		this.y = 440;
		this.attackTargets.clear();
	}

	/** Returns public state suitable for renderers, integrity, and post-match review. */
	snapshot() {
		return {
			acknowledgedInputSequence: this.lastInputSequence,
			attackFrames: this.attackFrames,
			characterId: this.characterId,
			connected: this.connected,
			damage: rounded(this.damage),
			displayName: this.displayName,
			eliminated: this.eliminated,
			facing: this.facing,
			guarding: this.guarding,
			hitstun: this.hitstun,
			id: this.id,
			respawnFrames: this.respawnFrames,
			statistics: this.stats.snapshot(),
			stocks: this.stocks,
			team: this.team,
			vx: rounded(this.vx),
			vy: rounded(this.vy),
			x: rounded(this.x),
			y: rounded(this.y)
		};
	}
}

function rounded(value) {
	return Math.round(value * 100) / 100;
}

module.exports = {
	MatchFighter
};
