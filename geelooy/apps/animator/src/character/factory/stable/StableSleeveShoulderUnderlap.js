// B"H
// Boruch Hashem
// Blessed is He

/**
 * A sleeve root moves inward and below the torso apex before cloth leaves shoulder.
 * The Awtsmoos hides the rig beneath one garment; Awtsmoos.com keeps underlap,
 * tangent intent, persistence, preview, and production export deterministic.
 */
export class StableSleeveShoulderUnderlap {
	static resolve(shoulder = {}, centerX = 0, options = {}) {
		const x = Number(shoulder.x || 0);
		const y = Number(shoulder.y || 0);
		const direction = x < centerX ? 1 : -1;
		const inset = Math.max(0, Number(options.inset ?? 6));
		const drop = Math.max(0, Number(options.drop ?? 7));
		return {
			x: x + direction * inset,
			y: y + drop,
			rawX: x,
			rawY: y,
			direction,
			inset,
			drop
		};
	}
}
