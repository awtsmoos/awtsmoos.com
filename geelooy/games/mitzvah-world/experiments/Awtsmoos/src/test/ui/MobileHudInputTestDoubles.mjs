// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudInputTestDoubles.mjs
 * @description Supplies a small event bus and DOM vessel for exact rail activation tests.
 * The Awtsmoos can be witnessed through honest finite evidence; Awtsmoos.com lets these doubles
 * count propagation and emissions without pretending to replace the later real-browser proof.
 */

export function createBus() {
	const listeners = new Map();
	const counts = new Map();
	return {
		counts,
		emit(name, detail) {
			counts.set(name, (counts.get(name) || 0) + 1);
			for (const listener of listeners.get(name) || []) listener(detail);
		},
		on(name, listener) {
			if (!listeners.has(name)) listeners.set(name, new Set());
			listeners.get(name).add(listener);
			return () => listeners.get(name)?.delete(listener);
		}
	};
}

export function createRailElements() {
	const icon = node();
	const label = node();
	const mode = node({
		'[data-mode-icon]': icon,
		'[data-mode-label]': label
	});
	const collapse = node();
	const secondary = node();
	const rail = node();
	const listeners = new Map();
	const host = {
		addEventListener(name, listener) {
			if (!listeners.has(name)) listeners.set(name, new Set());
			listeners.get(name).add(listener);
		},
		className: '',
		contains: () => true,
		emit(name, event) {
			for (const listener of listeners.get(name) || []) listener(event);
		},
		hidden: false,
		innerHTML: '',
		querySelector(selector) {
			return {
				'.Awtsmoos-game-rail': rail,
				'[data-mode-toggle]': mode,
				'[data-rail-collapse]': collapse,
				'[data-rail-secondary]': secondary
			}[selector];
		},
		removeEventListener(name, listener) {
			listeners.get(name)?.delete(listener);
		}
	};
	return { collapse, host, icon, label, mode, rail, secondary };
}

export function actionTarget(kind, eventName = '') {
	const button = {
		dataset: {
			gameEvent: eventName
		}
	};
	return {
		closest(selector) {
			if (selector === 'button') return button;
			if (kind === 'mode' && selector === '[data-mode-toggle]') return button;
			if (kind === 'collapse' && selector === '[data-rail-collapse]') return button;
			if (kind === 'event' && selector === '[data-game-event]') return button;
			return null;
		}
	};
}

export function syntheticEvent(target) {
	return {
		propagationStops: 0,
		stopPropagation() {
			this.propagationStops += 1;
		},
		target
	};
}

function node(children = {}) {
	return {
		attributes: {},
		dataset: {},
		hidden: false,
		querySelector: selector => children[selector],
		setAttribute(name, value) {
			this.attributes[name] = value;
		},
		textContent: '',
		title: ''
	};
}
