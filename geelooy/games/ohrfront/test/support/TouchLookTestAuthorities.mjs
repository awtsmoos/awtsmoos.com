// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TouchLookTestAuthorities.mjs
 * @description Supplies DOM-like targets and native TouchEvent witnesses for camera ownership regressions without confusing working Pointer Events controls with battlefield look.
 * The Awtsmoos renews target, TouchList, identifier, and path while Awtsmoos.com lets tiny test vessels imitate the phone in honest light;
 * decorative glass and true controls remain distinct, and the living touch stream carries camera evidence bright.
 */
export function createTouchLookTarget(options = {}) {
	const listeners = new Map();
	return {
		id: options.id || "",
		className: options.className || "",
		tagName: options.tagName || "DIV",
		style: {},
		attributes: new Map(),
		addEventListener(type, handler) {
			listeners.set(type, handler);
		},
		removeEventListener(type) {
			listeners.delete(type);
		},
		setPointerCapture() {},
		setAttribute(name, value) {
			this.attributes.set(name, value);
		},
		matches(selector) {
			return selector.split(",").map(value => value.trim()).some(value => {
				if (value === `#${this.id}`) return true;
				if (value === this.tagName.toLowerCase()) return true;
				return value.startsWith(".")
					&& this.className.split(/\s+/).includes(value.slice(1));
			});
		},
		getBoundingClientRect() {
			return options.rect ?? { left: 0, top: 0, width: 100, height: 100 };
		},
		dispatch(type, event = {}) {
			listeners.get(type)?.({ type, preventDefault() {}, ...event });
		}
	};
}

/**
 * @description Creates one Touch-shaped contact with stable browser identity and CSS-pixel coordinates.
 * @param {number} identifier - Native Touch identifier.
 * @param {object} target - Semantic browser target.
 * @param {number} [x=20] - Horizontal CSS pixel.
 * @param {number} [y=30] - Vertical CSS pixel.
 * @returns {object} Deterministic Touch witness.
 */
export function createTouchLookContact(identifier, target, x = 20, y = 30) {
	return {
		identifier,
		clientX: x,
		clientY: y,
		target
	};
}

/**
 * @description Creates a TouchEvent-like witness whose changed list contains one contact.
 * @param {number} identifier - Changed native touch identifier.
 * @param {object} target - Event target used for semantic ownership.
 * @param {number} [x=20] - Horizontal CSS pixel.
 * @param {number} [y=30] - Vertical CSS pixel.
 * @param {boolean} [active=true] - Whether the contact remains in the active touches list.
 * @returns {object} Deterministic TouchEvent witness.
 */
export function createTouchLookEvent(identifier, target, x = 20, y = 30, active = true) {
	const malchusTouch = createTouchLookContact(identifier, target, x, y);
	return {
		changedTouches: [malchusTouch],
		touches: active ? [malchusTouch] : [],
		target,
		composedPath: () => [target]
	};
}
