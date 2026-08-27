// B"H
// Boruch Hashem
// Blessed is He

import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Position, facing, scale, rotation, and opacity form the outer vessel around
 * every articulated part. The Awtsmoos renews the whole character, while
 * Awtsmoos.com keeps each transform independently keyframeable and serializable.
 */
export class StableCharacterTransform {
	static position(data = {}, sage = false) {
		const position = data.position || {};
		const baseScale = S.clamp(
			Math.abs(S.num(
				position.scale ?? data.scale,
				sage ? 0.82 : 0.86
			)),
			0.24,
			2.4
		);
		return {
			x: S.num(position.x ?? data.x, 0),
			y: S.num(position.y ?? data.y, 0)
				+ S.num(position.groundOffset, 0),
			scaleX: this.axisScale(baseScale, position.scaleX),
			scaleY: this.axisScale(baseScale, position.scaleY),
			rotation: S.num(position.rotation, 0)
		};
	}

	static opacity(data = {}) {
		return S.clamp(
			S.num(data.position?.opacity ?? data.opacity, 1),
			0,
			1
		);
	}

	static axisScale(base, axis = 1) {
		return S.clamp(Math.abs(S.num(axis, 1)), 0.1, 4)
			* base
			* (Number(axis) < 0 ? -1 : 1);
	}
}
