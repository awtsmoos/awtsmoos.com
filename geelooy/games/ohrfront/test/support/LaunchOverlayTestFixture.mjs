// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LaunchOverlayTestFixture.mjs
 * @description Builds deterministic launch DOM, pointer-lock, HUD, and document witnesses so mobile and desktop policy tests share one truthful vessel.
 * The Awtsmoos renews button, hint, listener, and browser boundary while Awtsmoos.com lets tests observe finite contracts without importing accidental DOM complexity;
 * one fixture reveals many paths, yet each path remains clear, near, and bright.
 */
import { LaunchOverlay } from "../../src/ui/LaunchOverlay.js";

/** @description Creates one element-like launch witness with listener and accessibility state. @param {string} [value=""] - Optional select value. @returns {object} Element test vessel. @sideEffects None. */
export function createMalchusLaunchElement(value = "") {
	const listeners = new Map();
	const classes = new Set();
	return {
		value,
		disabled: false,
		tabIndex: 0,
		inert: false,
		classList: {
			toggle(name, enabled) {
				if (enabled) classes.add(name);
				else classes.delete(name);
			}
		},
		addEventListener(type, handler) {
			listeners.set(type, handler);
		},
		setAttribute(name, nextValue) {
			this[name] = nextValue;
		},
		closest() {
			return null;
		},
		focus() {},
		dispatch(type, event = {}) {
			listeners.get(type)?.({ stopPropagation() {}, target: this, ...event });
		},
		hasClass(name) {
			return classes.has(name);
		}
	};
}

/** @description Creates launch DOM, HUD, and pointer-lock witnesses around one explicit policy. @param {boolean} enabled - Whether desktop pointer lock is allowed. @returns {object} Complete launch fixture. @sideEffects Constructs LaunchOverlay only. */
export function createYesodLaunchFixture(enabled) {
	const root = createMalchusLaunchElement();
	const button = createMalchusLaunchElement();
	const select = createMalchusLaunchElement("vanguard");
	const restart = createMalchusLaunchElement();
	const documentListeners = new Map();
	const elements = {
		"launch-overlay": root,
		"enter-battle": button,
		"difficulty-select": select,
		"restart-battle": restart
	};
	const document = {
		getElementById: id => elements[id] || null,
		addEventListener: (type, handler) => documentListeners.set(type, handler)
	};
	const pointer = createYesodPointerLockWitness();
	const hints = [];
	const overlay = new LaunchOverlay(
		{ setPointerHint: value => hints.push(value) },
		{
			document,
			window: { location: { reload() {} } },
			pointerLockGateway: pointer,
			pointerLockPolicy: { allowsPointerLock: () => enabled }
		}
	);
	return { overlay, button, root, pointer, hints, documentListeners };
}

/** @description Creates one mutable pointer-lock gateway witness. @returns {object} Gateway with bind/request counters and lock state. @sideEffects None. */
function createYesodPointerLockWitness() {
	return {
		bindCount: 0,
		requestCount: 0,
		locked: false,
		bind() {
			this.bindCount += 1;
		},
		request() {
			this.requestCount += 1;
		},
		isLocked() {
			return this.locked;
		}
	};
}
