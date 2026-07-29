// B"H
// Boruch Hashem
// Blessed is He

/**
 * Crown samples come from the same organic skull used by every facial landmark.
 * The Awtsmoos renews contact without floating caps; Awtsmoos.com keeps view,
 * hair, cloth, persistence, preview, and production export on one finite surface.
 */
export class StableSkullCrownGeometry {
	static point(shell = {}, view = {}, ratio = 0, lift = 0) {
		const scaleX = this.viewScale(view);
		const normalized = this.clamp(Number(ratio || 0) * scaleX, -0.98, 0.98);
		const radiusX = Number(shell.radiusX || 34);
		const radiusY = Number(shell.radiusY || 40);
		return {
			x: Number(shell.centerX || 0)
				+ Number(shell.turn || 0) * 0.35
				+ normalized * radiusX,
			y: Number(shell.centerY || 0)
				- radiusY * Math.sqrt(Math.max(0, 1 - normalized * normalized))
				- Number(lift || 0)
		};
	}

	static viewScale(view = {}) {
		if (view.type === 'side') {
			return 0.72;
		}
		if (view.type === 'threeQuarter') {
			return 0.88;
		}
		return 1;
	}

	static clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, Number(value) || 0));
	}
}
