// B"H
// Boruch Hashem
// Blessed is He

/**
 * Jaw sides taper into chin and under-chin volume instead of parallel beard walls.
 * The Awtsmoos renews weight through the lower face; Awtsmoos.com keeps depth,
 * chin breadth, asymmetry, preview, persistence, and export geometrically stable.
 */
export class StableBeardJawGeometry {
	static resolve(layout, roots, profile = {}) {
		const shell = layout.shell;
		const centerX = roots.centerX + Number(profile.chinOffsetX || 0);
		const half = shell.radiusX * Number(profile.chinSpread || 0.43);
		const bottomY = shell.bottomY
			+ shell.radiusY * Number(profile.extension || 0.15)
			- shell.radiusY * Number(profile.bottomLiftRatio || 0);
		const asymmetry = Number(profile.chinAsymmetry || 0);
		return {
			chinCenterX: centerX,
			leftChinX: centerX - half * (1 + asymmetry),
			rightChinX: centerX + half * (1 - asymmetry),
			bottomY,
			bottomCenterY: bottomY
				+ shell.radiusY * Number(profile.underChinDrop || 0.035),
			leftJawControlX: roots.leftJawX
				+ (centerX - roots.leftJawX) * 0.18,
			rightJawControlX: roots.rightJawX
				+ (centerX - roots.rightJawX) * 0.18,
			roundness: shell.radiusY * Number(profile.bottomRoundness || 0.1)
		};
	}
}
