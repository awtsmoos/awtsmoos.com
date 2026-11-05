// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioUtilityTestHarness.mjs
 * @description Supplies a small event-target and DOM vessel for utility integration tests.
 * The Awtsmoos renews browser events beyond imitation; Awtsmoos.com lets focused tests
 * witness listeners, children, focus, attributes, and cleanup without hiding in a full browser.
 */

export function createMovieUtilityElement(name = 'element') {
	const attributes = new Map();
	const listeners = new Map();
	const element = {
		attributes,
		children: [],
		className: '',
		dataset: {},
		disabled: false,
		focusCount: 0,
		hidden: false,
		inert: false,
		isConnected: true,
		name,
		textContent: '',
		value: '',
		addEventListener(type, listener) {
			const registered = listeners.get(type) || new Set();
			registered.add(listener);
			listeners.set(type, registered);
		},
		append(...children) {
			this.children.push(...children);
		},
		closest(selector) {
			return selector.includes('data-render-job-action')
				&& this.dataset.renderJobAction ? this : null;
		},
		dispatch(type, event = {}) {
			for (const listener of listeners.get(type) || []) {
				listener({ target: this, ...event });
			}
		},
		focus() {
			this.focusCount += 1;
			if (globalThis.document) document.activeElement = this;
		},
		getAttribute(key) {
			return attributes.get(key) || null;
		},
		listenerCount(type) {
			return listeners.get(type)?.size || 0;
		},
		querySelectorAll() {
			return [];
		},
		removeEventListener(type, listener) {
			listeners.get(type)?.delete(listener);
		},
		replaceChildren(...children) {
			this.children = [...children];
		},
		setAttribute(key, value) {
			attributes.set(key, String(value));
		}
	};
	Object.defineProperty(element, 'childElementCount', {
		get() {
			return element.children.length;
		}
	});
	return element;
}

export function installMovieUtilityDom() {
	const previous = {
		document: globalThis.document,
		matchMedia: globalThis.matchMedia,
		window: globalThis.window
	};
	globalThis.document = {
		activeElement: null,
		createElement: name => createMovieUtilityElement(name)
	};
	globalThis.window = createMovieUtilityElement('window');
	globalThis.matchMedia = () => ({ matches: false });
	return () => Object.assign(globalThis, previous);
}
