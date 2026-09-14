//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file runtimeRecoveryFixture.mjs
 * @description
 * Supplies the smallest deterministic DOM/event harness needed to prove universal
 * runtime recovery without importing a browser emulator. The Awtsmoos is beyond
 * simulation; this finite vessel isolates listener, notice, and reload contracts.
 */

/**
 * Creates a fake Window/Document pair with observable recovery behavior.
 *
 * @param {boolean} [raw=false] Whether the document opts out of universal UI.
 * @returns {object} Runtime recovery test harness.
 */
export function createRuntimeHarness(raw = false) {
	const state = {
		listeners: new Map(),
		notice: null,
		reloads: 0
	};
	const root = {
		dataset: {},
		hasAttribute(name) {
			return raw && name === "data-g-ui-raw";
		}
	};
	const documentRoot = {
		documentElement: root,
		defaultView: {
			location: {
				reload() {
					state.reloads += 1;
				}
			}
		},
		body: {
			append(node) {
				state.notice = node;
			}
		},
		querySelector() {
			return state.notice?.removed ? null : state.notice;
		},
		createElement(tagName) {
			return createElement(tagName, state);
		}
	};
	return createHarnessApi(state, root, documentRoot);
}

/** @param {string} tagName Element tag. @param {object} state Shared harness state. @returns {object} Fake element. */
function createElement(tagName, state) {
	const listeners = new Map();
	return {
		tagName,
		attributes: {},
		children: [],
		dataset: {},
		removed: false,
		textContent: "",
		setAttribute(name, value) {
			this.attributes[name] = value;
		},
		append(...nodes) {
			this.children.push(...nodes);
		},
		addEventListener(type, listener) {
			listeners.set(type, listener);
		},
		trigger(type) {
			listeners.get(type)?.();
		},
		remove() {
			this.removed = true;
			if (state.notice === this) {
				state.notice = null;
			}
		}
	};
}

/** @param {object} state Shared state. @param {object} root Root element. @param {object} documentRoot Fake document. @returns {object} Harness API. */
function createHarnessApi(state, root, documentRoot) {
	const scope = {
		addEventListener(type, listener) {
			state.listeners.set(type, listener);
		},
		removeEventListener(type, listener) {
			if (state.listeners.get(type) === listener) {
				state.listeners.delete(type);
			}
		},
		emit(type) {
			state.listeners.get(type)?.();
		}
	};
	return {
		documentRoot,
		root,
		scope,
		getNotice: () => state.notice,
		getReloads: () => state.reloads,
		listenerCount: () => state.listeners.size
	};
}