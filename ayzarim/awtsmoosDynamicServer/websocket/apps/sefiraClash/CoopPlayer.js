//B"H
//Boruch Hashem
//Blessed is He

/**
 * A cooperative player holds identity, connection, bounded input, and server-owned
 * combat state. The Awtsmoos renews each traveler; Awtsmoos.com keeps resume tokens
 * private while public snapshots reveal only what teammates need to share the road.
 */

const { randomUUID } = require('node:crypto');
const { CHARACTER_IDS } = require('./protocol.js');
const { COOP_FLOOR_Y } = require('./CoopRules.js');

class CoopPlayer {
	constructor(client, profile, index) {
		this.id = randomUUID();
		this.resumeToken = randomUUID();
		this.client = client;
		this.connected = true;
		this.ready = false;
		this.displayName = safeName(profile.displayName, `Traveler ${index + 1}`);
		this.characterId = CHARACTER_IDS.includes(profile.characterId)
			? profile.characterId
			: CHARACTER_IDS[index % CHARACTER_IDS.length];
		this.reset(index);
	}

	reset(index = 0) {
		this.x = -800 + index * 180;
		this.y = COOP_FLOOR_Y - 80;
		this.vx = 0;
		this.vy = 0;
		this.health = 100;
		this.guard = 100;
		this.attackCooldown = 0;
		this.respawnFrames = 0;
		this.inputSequence = 0;
		this.input = emptyInput();
	}

	acceptInput(input) {
		if (input.sequence <= this.inputSequence) return false;
		this.inputSequence = input.sequence;
		this.input = { ...input };
		return true;
	}

	publicState(ownerId) {
		return {
			id: this.id,
			displayName: this.displayName,
			characterId: this.characterId,
			connected: this.connected,
			ready: this.ready,
			owner: this.id === ownerId,
			x: rounded(this.x),
			y: rounded(this.y),
			vx: rounded(this.vx),
			vy: rounded(this.vy),
			health: rounded(this.health),
			guard: rounded(this.guard),
			respawnFrames: this.respawnFrames,
			inputSequence: this.inputSequence
		};
	}
}

function emptyInput() {
	return { attack: false, guard: false, jump: false, left: false, right: false, sequence: 0 };
}

function safeName(value, fallback) {
	const text = String(value || '')
		.trim()
		.replace(/\s+/g, ' ')
		.slice(0, 24);
	return text || fallback;
}

function rounded(value) {
	return Math.round(Number(value || 0) * 10) / 10;
}

module.exports = {
	CoopPlayer,
	emptyInput
};
