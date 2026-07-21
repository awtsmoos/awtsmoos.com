// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarInputTestHarness.mjs
 * @description Supplies deterministic event, timer, slot, and runtime vessels for input proofs.
 * The Awtsmoos renews each instant with perfect accounting; this harness likewise exposes
 * every listener, timer, activation, and cleanup without hidden browser state on Awtsmoos.com.
 */

export class InputEventTarget {
	constructor() {
		this.listeners = new Map();
	}

	addEventListener(type, handler) {
		this.listeners.set(type, handler);
	}

	removeEventListener(type, handler) {
		if (this.listeners.get(type) === handler) this.listeners.delete(type);
	}

	emit(type, event) {
		return this.listeners.get(type)?.(event);
	}

	querySelector() {
		return null;
	}
}

export function createTimerHarness() {
	let callback = null;
	return {
		clearTimer() {
			callback = null;
		},
		fire() {
			const pending = callback;
			callback = null;
			return pending?.();
		},
		pending() {
			return Boolean(callback);
		},
		setTimer(nextCallback) {
			callback = nextCallback;
			return 9;
		}
	};
}

export function createSlot(slotIndex, abilityId = 'clarity') {
	return {
		classList: {
			add() {},
			remove() {}
		},
		dataset: {
			abilityId,
			slotIndex: String(slotIndex)
		}
	};
}

export function targetFor(slot) {
	return {
		closest(selector) {
			if (selector === '.Mitzvah-action-slot') return slot;
			return null;
		}
	};
}

export function createRuntime(rows = 2) {
	const activations = [];
	let locked = false;
	return {
		activations,
		activateSlot(slotIndex, context) {
			activations.push({ context, slotIndex });
			return { ok: true };
		},
		drag: {
			beginAbility() {},
			beginSlot() {},
			cancel() { return { ok: true }; },
			dropOnSlot() { return { ok: true }; },
			dropOutside() { return { ok: true }; },
			snapshot() { return { active: false }; }
		},
		store: {
			setLocked(value) {
				locked = Boolean(value);
			},
			snapshot() {
				return { locked, rows };
			}
		}
	};
}

export function keyEvent(code, shiftKey = false) {
	return {
		altKey: false,
		code,
		ctrlKey: false,
		metaKey: false,
		preventDefault() {},
		repeat: false,
		shiftKey,
		target: {}
	};
}

export function touchEvent(slot, overrides = {}) {
	return {
		button: 0,
		clientX: 2,
		clientY: 3,
		isPrimary: true,
		pointerId: 5,
		pointerType: 'touch',
		target: targetFor(slot),
		...overrides
	};
}
