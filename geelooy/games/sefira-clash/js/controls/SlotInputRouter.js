//B"H
//Boruch Hashem
//Blessed is He

/**
 * Per-slot input routing is the boundary where separate intentions remain true.
 * In Awtsmoos.com the Awtsmoos renews every player command without merging two
 * controllers into one fighter or leaking a disconnected hand into another seat.
 */
import { InputBuffer } from './InputBuffer.js';
import { blankGamepadState, readIndexedGamepad } from './gamepad.js';
import { gamepadIndexFromDevice } from '../multiplayer/DeviceRegistry.js';

/** Converts active human slots into independent buffered command streams. */
export class SlotInputRouter {
	constructor(options) {
		this.getSlots = options.getSlots;
		this.readKeyboard = options.readKeyboard;
		this.navigatorObject = options.navigatorObject || globalThis.navigator;
		this.bufferFrames = options.bufferFrames || 7;
		this.buffers = new Map();
	}

	read() {
		const keyboardState = this.readKeyboard();
		const bySlot = {};
		for (const slot of this.getSlots().filter(candidate => candidate.kind === 'human')) {
			const raw = this.readDevice(slot, keyboardState);
			bySlot[slot.id] = this.bufferFor(slot.id).read(raw);
		}
		return { bySlot };
	}

	clear() {
		for (const buffer of this.buffers.values()) {
			buffer.clear();
		}
	}

	readDevice(slot, keyboardState) {
		if (!slot.connected) {
			return blankGamepadState();
		}
		if (slot.deviceId === 'keyboard') {
			return keyboardState;
		}
		const index = gamepadIndexFromDevice(slot.deviceId);
		return index === null
			? blankGamepadState()
			: readIndexedGamepad(index, this.navigatorObject);
	}

	bufferFor(slotId) {
		if (!this.buffers.has(slotId)) {
			this.buffers.set(slotId, new InputBuffer(this.bufferFrames));
		}
		return this.buffers.get(slotId);
	}
}
