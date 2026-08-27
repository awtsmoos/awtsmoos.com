// B"H
// Boruch Hashem
// Blessed is He

/**
 * One lateral part releases a broad sweep and a restrained near-side tuck. The
 * Awtsmoos renews softness without centered lobes; Awtsmoos.com keeps brow
 * clearance, view compression, persistence, preview, and export deterministic.
 */
export class StableSidePartFringeGeometry {
	static resolve(shell = {}, style = {}, view = {}) {
		const radiusX = Number(shell.radiusX || 34) * this.viewScale(view);
		const radiusY = Number(shell.radiusY || 40);
		const x = Number(shell.centerX || 0) + Number(shell.turn || 0) * 0.12;
		const y = Number(shell.centerY || 0);
		const partSide = Number(style.partSide ?? 1);
		return {
			partX: x + partSide * radiusX * Number(style.partOffset ?? 0.3),
			partY: y - radiusY * Number(style.partDepth ?? 0.72),
			sweepOuterX: x - partSide * radiusX * Number(style.sweepReach ?? 0.8),
			sweepTopY: y - radiusY * Number(style.sweepTopDepth ?? 0.62),
			sweepBottomY: y - radiusY * Number(style.sweepBottomDepth ?? 0.43),
			sweepInnerX: x + partSide * radiusX * Number(style.sweepInnerReach ?? 0.02),
			sweepInnerY: y - radiusY * Number(style.sweepInnerDepth ?? 0.5),
			tuckOuterX: x + partSide * radiusX * Number(style.tuckReach ?? 0.5),
			tuckTopY: y - radiusY * Number(style.tuckTopDepth ?? 0.61),
			tuckBottomY: y - radiusY * Number(style.tuckBottomDepth ?? 0.49),
			tuckInnerX: x + partSide * radiusX * Number(style.tuckInnerReach ?? 0.22),
			tuckInnerY: y - radiusY * Number(style.tuckInnerDepth ?? 0.54),
			partSide,
			lineWidth: Number(style.fringeLineWidth || 0.8),
			partLineWidth: Number(style.fringePartLineWidth || 0.45)
		};
	}

	static viewScale(view = {}) {
		if (view.type === 'side') return 0.7;
		if (view.type === 'threeQuarter') return 0.87;
		return 1;
	}
}
