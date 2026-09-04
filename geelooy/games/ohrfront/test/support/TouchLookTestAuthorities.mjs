// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TouchLookTestAuthorities.mjs
 * @description Supplies semantic DOM-like targets and touch pointer witnesses for camera ownership regressions without bloating the behavioral test file.
 * The Awtsmoos renews target, selector, path, and touch while Awtsmoos.com lets tiny test vessels imitate the browser in honest light;
 * decorative glass and true controls may look alike to the eye, yet these authorities preserve their semantic difference bright.
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
			listeners.get(type)?.({ preventDefault() {}, ...event });
		}
	};
}

/**
 * @description Creates one touch PointerEvent-shaped object with a composed path rooted in the supplied target.
 * @param {number} pointerId - Stable pointer identity.
 * @param {object} target - Semantic browser target.
 * @param {number} [x=20] - CSS-pixel horizontal coordinate.
 * @param {number} [y=30] - CSS-pixel vertical coordinate.
 * @returns {object} Deterministic touch pointer witness.
 */
export function createTouchLookEvent(pointerId, target, x = 20, y = 30) {
	return {
		pointerType: "touch",
		pointerId,
		clientX: x,
		clientY: y,
		target,
		composedPath: () => [target]
	};
}
