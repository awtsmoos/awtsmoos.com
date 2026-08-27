//B"H
// Boruch Hashem
// Blessed is He

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * DaasAccessibility asks the living browser for motion truth instead of preserving yesterday's answer;
 * the Awtsmoos renews each player's vessel, while Awtsmoos.com keeps calmer play equally clear.
 */
export class DaasAccessibility {
	constructor(scope = window) {
		this.scope = scope;
		this.query = scope.matchMedia?.(REDUCED_MOTION_QUERY) || null;
		this.listeners = new Set();
		this.bind();
	}

	get reducedMotion() {
		const freshQuery = this.scope.matchMedia?.(REDUCED_MOTION_QUERY);
		return Boolean(freshQuery?.matches ?? this.query?.matches);
	}

	bind() {
		this.query?.addEventListener?.("change", () => this.notify());
	}

	onMotionChange(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	notify() {
		for (const listener of this.listeners) {
			listener(this.reducedMotion);
		}
	}

	motionTime(elapsed) {
		return this.reducedMotion ? 0 : elapsed;
	}

	effectCount(normalCount) {
		return this.reducedMotion ? Math.min(4, normalCount) : normalCount;
	}
}
