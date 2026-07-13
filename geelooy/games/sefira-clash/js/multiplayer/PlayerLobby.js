//B"H
//Boruch Hashem
//Blessed is He

/**
 * The local lobby gathers separate wills into one honest Awtsmoos.com match.
 * The Awtsmoos renews every slot without erasing its device, character, team,
 * readiness, or CPU identity, so setup becomes runtime truth.
 */
import { CHARACTERS, characterById } from '../data/characters.js';
import { createMatchRules } from './MatchRules.js';
import { createDefaultPlayerSlots } from './PlayerLobbyDefaults.js';
import { PlayerSlot } from './PlayerSlot.js';

/** Owns two-to-four local player slots and their validated match choices. */
export class PlayerLobby {
	constructor(options = {}) {
		this.rules = createMatchRules(options.rules);
		this.slots = options.slots
			? options.slots.map(slot => new PlayerSlot(slot))
			: createDefaultPlayerSlots();
	}

	slot(index) {
		return this.slots[index] || null;
	}

	setKind(index, kind, deviceId = null) {
		const slot = requiredSlot(this.slot(index));
		if (kind === 'human') {
			this.assignDevice(index, deviceId || 'keyboard');
			return;
		}
		if (kind === 'cpu') {
			slot.activateCpu();
			return;
		}
		slot.close();
	}

	assignDevice(index, deviceId) {
		const slot = requiredSlot(this.slot(index));
		const duplicate = this.slots.find(other => {
			return other.id !== slot.id && other.deviceId === deviceId;
		});
		if (duplicate) {
			throw new Error(`Device already assigned to ${duplicate.id}`);
		}
		slot.activateHuman(deviceId);
	}

	setCharacter(index, characterId) {
		const slot = requiredSlot(this.slot(index));
		slot.characterId = characterById(characterId).id;
		slot.ready = slot.kind === 'cpu';
	}

	cycleCharacter(index, direction = 1) {
		const slot = requiredSlot(this.slot(index));
		const current = CHARACTERS.findIndex(character => {
			return character.id === slot.characterId;
		});
		const next = (current + direction + CHARACTERS.length) % CHARACTERS.length;
		this.setCharacter(index, CHARACTERS[next].id);
	}

	setTeam(index, team) {
		const slot = requiredSlot(this.slot(index));
		slot.team = Math.max(1, Math.min(4, Number(team) || 1));
	}

	toggleReady(index) {
		const slot = requiredSlot(this.slot(index));
		if (slot.kind === 'human' && slot.connected) {
			slot.ready = !slot.ready;
		}
	}

	syncConnections(registry) {
		for (const slot of this.humanSlots()) {
			slot.connected = registry.isConnected(slot.deviceId);
			if (!slot.connected) {
				slot.ready = false;
			}
		}
	}

	activeSlots() {
		return this.slots.filter(slot => slot.kind !== 'closed');
	}

	humanSlots() {
		return this.slots.filter(slot => slot.kind === 'human');
	}

	canStart() {
		const active = this.activeSlots();
		const readyHumans = this.humanSlots().every(slot => {
			return slot.ready && slot.connected;
		});
		return active.length >= 2 && readyHumans;
	}

	snapshot() {
		return {
			rules: { ...this.rules },
			slots: this.slots.map(slot => slot.snapshot())
		};
	}
}

function requiredSlot(slot) {
	if (!slot) {
		throw new Error('Player slot does not exist.');
	}
	return slot;
}
