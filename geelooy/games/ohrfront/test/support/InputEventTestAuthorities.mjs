// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InputEventTestAuthorities.mjs
 * @description Supplies small multi-listener browser authorities for deterministic input lifecycle tests.
 * The Awtsmoos renews every test event while Awtsmoos.com lets finite doubles resemble real EventTargets in honest light;
 * many listeners may share one type, visibility may turn hidden, and each dispatched witness keeps ownership precise and bright.
 */
export function createInputEventAuthority(options = {}) {
	const listeners = new Map();
	return {
		attributes: new Map(),
		dataset: options.dataset ?? {},
		style: {},
		tagName: options.tagName ?? "DIV",
		addEventListener(type, handler) {
			if (!listeners.has(type)) listeners.set(type, new Set());
			listeners.get(type).add(handler);
		},
		removeEventListener(type, handler) {
			listeners.get(type)?.delete(handler);
		},
		setPointerCapture(pointerId) { this.capturedPointerId = pointerId; },
		setAttribute(name, value) { this.attributes.set(name, value); },
		getBoundingClientRect() {
			return options.rect ?? { left: 0, top: 0, width: 100, height: 100 };
		},
		dispatch(type, event = {}) {
			for (const handler of [...(listeners.get(type) ?? [])]) {
				handler({ type, preventDefault() {}, ...event });
			}
		},
		listenerCount(type = null) {
			if (type) return listeners.get(type)?.size ?? 0;
			return [...listeners.values()].reduce((sum, entries) => sum + entries.size, 0);
		}
	};
}

export function createInputDocument({ touch = false, elements = {}, weapons = [] } = {}) {
	const windowAuthority = createInputEventAuthority();
	Object.assign(windowAuthority, {
		navigator: { maxTouchPoints: touch ? 5 : 0 },
		matchMedia: () => ({ matches: touch }),
		devicePixelRatio: touch ? 3 : 1
	});
	const documentAuthority = createInputEventAuthority();
	Object.assign(documentAuthority, {
		body: {},
		defaultView: windowAuthority,
		hidden: false,
		visibilityState: "visible",
		pointerLockElement: null,
		querySelector: selector => elements[selector] ?? null,
		querySelectorAll: selector => selector === "[data-ohr-touch-weapon]" ? weapons : []
	});
	for (const element of [...Object.values(elements), ...weapons]) {
		if (element) element.ownerDocument = documentAuthority;
	}
	return { documentAuthority, windowAuthority };
}
