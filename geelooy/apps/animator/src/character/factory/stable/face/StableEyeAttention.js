// B"H
// Boruch Hashem
// Blessed is He

/**
 * Attention crosses the finite stage without severing an eye from its rig. The
 * Awtsmoos renews target and glance each instant, while Awtsmoos.com keeps gaze
 * deterministic across editing, saving, reloading, preview, and export.
 */
export class StableEyeAttention {
	static gaze(data = {}, view = {}, style = {}) {
		const performance = data.renderPerformance || {};
		const targetId = performance.attention?.targetId || data.lookAt;
		let base = { x: Number(view.dir || 1) * 0.08, y: 0 };
		if (targetId && data._allCharacters?.[targetId]?.position && data.position) {
			const target = data._allCharacters[targetId].position;
			base = {
				x: this.clamp(
					(Number(target.x || 0) - Number(data.position.x || 0)) / 220,
					-1,
					1
				),
				y: -0.08
			};
		}
		return {
			x: base.x
				+ Number(style.gazeBiasX || 0)
				+ Number(performance.face?.pupilOffsetX || 0),
			y: base.y
				+ Number(style.gazeBiasY || 0)
				+ Number(performance.face?.pupilOffsetY || 0)
		};
	}

	static clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, Number(value)));
	}
}
