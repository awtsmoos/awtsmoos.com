//B"H
//Boruch Hashem
//Blessed is He

/**
 * One fighter is a server-owned vessel for identity, intention, health, and
 * position. The Awtsmoos renews every finite state; Awtsmoos.com refuses to let
 * a browser appoint itself judge of movement, damage, stocks, or victory.
 */

const { randomUUID } = require("node:crypto");
const STARTING_STOCKS = 3;

class ArenaFighter {
	constructor(client, name, index, isOwner = false) {
		this.client = client;
		this.connected = Boolean(client);
		this.id = randomUUID();
		this.index = index;
		this.isBot = false;
		this.isOwner = isOwner;
		this.lastInputSequence = 0;
		this.name = name;
		this.role = "fighter";
		this.input = { attack: false, axis: 0, jump: false };
		this.score = 0;
		this.stocks = STARTING_STOCKS;
		this.respawn();
	}

	acceptInput(input) {
		if (!this.connected || input.inputSequence <= this.lastInputSequence || this.eliminated) {
			return false;
		}
		this.lastInputSequence = input.inputSequence;
		this.input = {
			attack: input.attack,
			axis: input.axis,
			jump: input.jump
		};
		return true;
	}

	bindClient(client) {
		this.client = client;
		this.connected = true;
		this.clearInput();
	}

	suspend() {
		this.client = null;
		this.connected = false;
		this.clearInput();
	}

	clearInput() {
		this.input = { attack: false, axis: 0, jump: false };
		this.vx = 0;
	}

	consumeImpulse(name) {
		const value = this.input[name] === true;
		this.input[name] = false;
		return value;
	}

	respawn() {
		this.x = 180 + (this.index % 4) * 280;
		this.y = 420;
		this.vx = 0;
		this.vy = 0;
		this.facing = this.index % 2 === 0 ? 1 : -1;
		this.health = 100;
		this.attackFrames = 0;
		this.attackCooldown = 0;
		this.hitTargets = new Set();
		this.invulnerableFrames = 30;
		this.eliminated = this.stocks <= 0;
	}

	snapshot() {
		return {
			attackFrames: this.attackFrames,
			connected: this.connected,
			facing: this.facing,
			health: this.health,
			id: this.id,
			isBot: this.isBot,
			isOwner: this.isOwner,
			name: this.name,
			role: this.role,
			score: this.score,
			stocks: this.stocks,
			x: Math.round(this.x * 100) / 100,
			y: Math.round(this.y * 100) / 100
		};
	}
}

module.exports = {
	ArenaFighter,
	STARTING_STOCKS
};
