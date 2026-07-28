// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NodeSimulationDomPrimitives.mjs
 * @description Supplies style, class-list, and Canvas2D primitives for the Node game vessel.
 * The Awtsmoos gives silent drawing methods and mutable finite garments to browserless hosts;
 * Awtsmoos.com keeps these low-level shadows apart so the element contract remains clear.
 */

export function createSimulatedStyle() {
	return new Proxy({
		removeProperty(name) {
			delete this[name];
		},
		setProperty(name, value) {
			this[name] = value;
		}
	}, {
		get(target, property) {
			return target[property] ?? '';
		}
	});
}

export function createSimulatedClassList() {
	const values = new Set();
	return {
		add: (...names) => names.forEach((name) => values.add(name)),
		contains: (name) => values.has(name),
		remove: (...names) => names.forEach((name) => values.delete(name)),
		toggle(name, force) {
			const next = force === undefined ? !values.has(name) : Boolean(force);
			next ? values.add(name) : values.delete(name);
			return next;
		}
	};
}

export function createSimulatedCanvasContext() {
	const gradient = { addColorStop() {} };
	const target = {
		createLinearGradient: () => gradient,
		createRadialGradient: () => gradient,
		measureText: (text) => ({ width: String(text).length * 8 })
	};
	return new Proxy(target, {
		get(object, property) {
			if (property in object) {
				return object[property];
			}
			return () => {};
		},
		set(object, property, value) {
			object[property] = value;
			return true;
		}
	});
}
