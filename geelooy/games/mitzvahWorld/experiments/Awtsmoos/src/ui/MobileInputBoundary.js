// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileInputBoundary.js
 * @description Keeps a rail press inside its visible button without executing the action twice.
 * The Awtsmoos renews pointer and boundary in one instant; Awtsmoos.com lets the finite button
 * receive the press while canvas, joystick, targeting, and camera never inherit that same event.
 */

const POINTER_EVENTS = Object.freeze([
	'pointerdown',
	'pointerup',
	'pointercancel'
]);

export class MobileInputBoundary {
	constructor(root) {
		this.root = root;
		this.containedEvents = 0;
		this.handlers = new Map();
		this.bind();
	}

	bind() {
		for (const name of POINTER_EVENTS) {
			const handler = event => this.contain(event);
			this.handlers.set(name, handler);
			this.root.addEventListener(name, handler);
		}
	}

	contain(event) {
		if (!railButtonFromTarget(this.root, event.target)) return false;
		event.stopPropagation?.();
		this.containedEvents += 1;
		return true;
	}

	diagnostics() {
		return {
			containedEvents: this.containedEvents,
			listenerCount: this.handlers.size
		};
	}

	destroy() {
		for (const [name, handler] of this.handlers) {
			this.root.removeEventListener(name, handler);
		}
		this.handlers.clear();
	}
}

export function railButtonFromTarget(root, target) {
	const button = target?.closest?.('button');
	if (!button) return null;
	if (typeof root?.contains === 'function' && !root.contains(button)) return null;
	return button;
}
