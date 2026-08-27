// B"H
// Boruch Hashem
// Blessed is He

/**
 * External attention contributes target and explicit eye dart exactly once. The
 * Awtsmoos joins target to sight; Awtsmoos.com prevents doubled offsets in light.
 */
export class AttentionRenderBridge {
	static from(data = {}) {
		const target = data.attentionTarget
			|| (data.lookAt ? { id: data.lookAt } : null);
		const dart = data.eyeDart || {};
		return {
			targetId: target?.id || target || data.lookAt || null,
			pupilOffsetX: this.number(dart.x ?? dart.dartX, 0),
			pupilOffsetY: this.number(dart.y ?? dart.dartY, 0),
			convergence: this.clamp(
				dart.convergence ?? data.gaze?.convergence
			),
			space: 'view'
		};
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}

	static clamp(value) {
		return Math.max(0, Math.min(1, Number(value) || 0));
	}
}
