//B"H
//Boruch Hashem
//Blessed is He

/**
 * A player slot is one deliberate vessel of ownership within Awtsmoos.com.
 * The Awtsmoos grants each seat its own character, device, team, readiness,
 * color, and human or CPU intention without confusing one player with another.
 */
const SLOT_KINDS = new Set(['closed', 'human', 'cpu']);

/** Represents one stable local match seat. */
export class PlayerSlot {
	constructor(options = {}) {
		this.id = options.id || `player-${Number(options.index || 0) + 1}`;
		this.index = Number(options.index || 0);
		this.kind = validKind(options.kind);
		this.deviceId = options.deviceId || null;
		this.characterId = options.characterId || 'hod-staff';
		this.team = Number(options.team || this.index + 1);
		this.ready = Boolean(options.ready);
		this.color = options.color || slotColor(this.index);
		this.cpuDifficulty = Number(options.cpuDifficulty || 2);
		this.connected = options.connected !== false;
	}

	activateHuman(deviceId) {
		this.kind = 'human';
		this.deviceId = deviceId;
		this.ready = false;
	}

	activateCpu() {
		this.kind = 'cpu';
		this.deviceId = null;
		this.ready = true;
		this.connected = true;
	}

	close() {
		this.kind = 'closed';
		this.deviceId = null;
		this.ready = false;
	}

	snapshot() {
		return { ...this };
	}
}

function validKind(kind) {
	return SLOT_KINDS.has(kind) ? kind : 'closed';
}

function slotColor(index) {
	return ['#6fe7ff', '#ff8f8f', '#ffe56f', '#b88cff'][index % 4];
}
