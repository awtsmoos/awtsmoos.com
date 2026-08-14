// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollHarness
 * @description The Awtsmoos gives semantic river tests measured Hebrew content,
 * deterministic storage, events, document motion, and a manually advanced clock.
 */
export function createAutoScrollHarness() {
	const classes = new Set();
	const documentListeners = new Map();
	const windowListeners = new Map();
	const emittedStates = [];
	const storageValues = new Map();
	const frames = new Map();
	let frameIdentifier = 0;
	const style = { setProperty() {}, removeProperty() {} };
	const root = {
		scrollTop: 0,
		scrollHeight: 2400,
		clientHeight: 120,
		style
	};
	const reader = {
		innerText: Array(60).fill('מילה').join(' '),
		scrollHeight: 1200,
		clientWidth: 360,
		querySelectorAll: () => [],
		getBoundingClientRect: () => ({ width: 360, height: 1200 })
	};
	function addListener(map, type, handler) {
		const handlers = map.get(type) ?? [];
		handlers.push(handler);
		map.set(type, handlers);
	}
	globalThis.localStorage = {
		getItem: key => storageValues.get(key) ?? null,
		setItem: (key, value) => storageValues.set(key, String(value)),
		removeItem: key => storageValues.delete(key)
	};
	globalThis.getComputedStyle = () => ({ fontSize: '20px', lineHeight: '40px' });
	globalThis.CustomEvent = class CustomEvent {
		constructor(type, init = {}) {
			this.type = type;
			this.detail = init.detail;
		}
	};
	globalThis.window = {
		innerHeight: 120,
		get scrollY() { return root.scrollTop; },
		addEventListener: (type, handler) => addListener(windowListeners, type, handler),
		dispatchEvent(event) {
			if (event.type === 'awtsmoos:auto-scroll-state') emittedStates.push(event.detail);
			return true;
		},
		scrollBy(options) { root.scrollTop += Number(options.top || 0); },
		scrollTo(x, y) { root.scrollTop = Number(y || 0); }
	};
	globalThis.document = {
		scrollingElement: root,
		documentElement: root,
		visibilityState: 'visible',
		activeElement: null,
		addEventListener: (type, handler) => addListener(documentListeners, type, handler),
		querySelector: selector => selector === '#realPost' ? reader : null,
		querySelectorAll: () => [],
		body: {
			scrollTop: 0,
			scrollHeight: 2400,
			style,
			classList: {
				toggle(name, active) { active ? classes.add(name) : classes.delete(name); },
				contains(name) { return classes.has(name); }
			}
		}
	};
	globalThis.requestAnimationFrame = callback => {
		frameIdentifier += 1;
		frames.set(frameIdentifier, callback);
		return frameIdentifier;
	};
	globalThis.cancelAnimationFrame = identifier => frames.delete(identifier);
	return {
		classes,
		emittedStates,
		reader,
		root,
		storageValues,
		fireWindow(type, event = {}) {
			for (const handler of windowListeners.get(type) ?? []) handler(event);
		},
		runFrame(timestamp) {
			const entry = frames.entries().next().value;
			if (!entry) return false;
			const [identifier, callback] = entry;
			frames.delete(identifier);
			callback(timestamp);
			return true;
		},
		async loadRiver() {
			return import(`../AutoScrollDown.js?test=${Date.now()}`);
		}
	};
}
