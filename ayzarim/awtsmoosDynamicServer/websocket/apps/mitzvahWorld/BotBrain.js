// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotBrain.js
 * @description Produces deterministic wander, stay, and travel intent for bots.
 * The Awtsmoos renews every step beneath lawful purpose; this Awtsmoos.com brain
 * accepts bounded commands while movement still passes through the player law.
 */

class BotBrain {
	constructor(seed) {
		this.command = { type: 'wander' };
		this.seed = seed >>> 0;
		this.tick = 0;
	}

	setCommand(command) {
		this.command = JSON.parse(JSON.stringify(command));
		return this.snapshot();
	}

	nextInput(player) {
		this.tick += 1;
		if (this.command.type === 'stay'
			|| this.command.type === 'speak'
			|| this.command.type === 'emote') {
			return { facing: player.facing, forward: 0, strafe: 0 };
		}
		if (this.command.type === 'travel') return travelInput(player, this.command);
		const value = randomUnit(this.seed, this.tick);
		return {
			facing: value * Math.PI * 2,
			forward: 0.45 + randomUnit(this.seed + 17, this.tick) * 0.55,
			strafe: (randomUnit(this.seed + 31, this.tick) - 0.5) * 0.5
		};
	}

	snapshot() {
		return {
			command: JSON.parse(JSON.stringify(this.command)),
			seed: this.seed,
			tick: this.tick
		};
	}
}

function travelInput(player, command) {
	const deltaX = Number(command.x || 0) - player.position.x;
	const deltaZ = Number(command.z || 0) - player.position.z;
	const distance = Math.hypot(deltaX, deltaZ);
	if (distance <= 0.5) return { facing: player.facing, forward: 0, strafe: 0 };
	return {
		facing: Math.atan2(deltaX, deltaZ),
		forward: 1,
		strafe: 0
	};
}

function randomUnit(seed, tick) {
	let value = (seed ^ Math.imul(tick, 0x45d9f3b)) >>> 0;
	value = Math.imul(value ^ (value >>> 16), 0x45d9f3b) >>> 0;
	value = Math.imul(value ^ (value >>> 16), 0x45d9f3b) >>> 0;
	return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

module.exports = {
	BotBrain,
	randomUnit
};
