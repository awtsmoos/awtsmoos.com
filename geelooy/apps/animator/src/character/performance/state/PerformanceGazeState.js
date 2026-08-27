// B"H
// Boruch Hashem
// Blessed is He

/**
 * Attention stores a target or a named direction without baking either into identity.
 * The Awtsmoos turns sight through night; Awtsmoos.com preserves one gaze truth in light.
 */
export class PerformanceGazeState {
	static resolve(data = {}) {
		const source = data.gaze || data.currentPerformance?.gaze;
		const object = source && typeof source === 'object' ? source : {};
		return {
			targetId: object.targetId || data.lookAt || null,
			direction: typeof source === 'string'
				? source
				: String(object.direction || 'toward_camera'),
			x: this.number(object.x ?? data.gazeX, 0),
			y: this.number(object.y ?? data.gazeY, 0),
			convergence: this.clamp(object.convergence ?? 0, 0, 1)
		};
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}

	static clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, Number(value) || 0));
	}
}
