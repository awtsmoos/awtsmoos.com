// B"H
// Boruch Hashem
// Blessed is He

/**
 * Beard roots grow from real cheek and sideburn landmarks instead of a flat top.
 * The Awtsmoos renews each asymmetrical wing; Awtsmoos.com keeps root placement
 * normalized, view-aware, editable, serializable, and deterministic in export.
 */
export class StableBeardRootGeometry {
	static resolve(layout, profile = {}) {
		const shell = layout.shell;
		const centerX = layout.beard.centerX + Number(profile.centerX || 0);
		const leftScale = Number(profile.leftCheekScale || 1);
		const rightScale = Number(profile.rightCheekScale || 1);
		const rootY = layout.beard.rootY
			+ shell.radiusY * Number(profile.rootLift || 0)
			+ Number(profile.topOffset || 0);
		const jawY = shell.centerY
			+ shell.radiusY * Number(profile.jawDropRatio || 0.72);
		return {
			centerX,
			leftRootX: centerX
				- shell.radiusX * Number(profile.rootSpread || 0.64) * leftScale,
			rightRootX: centerX
				+ shell.radiusX * Number(profile.rootSpread || 0.64) * rightScale,
			leftRootY: rootY + Number(profile.leftRootDrop || 0),
			rightRootY: rootY + Number(profile.rightRootDrop || 0),
			leftCheekX: centerX
				- shell.radiusX * Number(profile.cheekSpread || 0.78) * leftScale,
			rightCheekX: centerX
				+ shell.radiusX * Number(profile.cheekSpread || 0.78) * rightScale,
			cheekY: rootY + (jawY - rootY) * 0.46,
			leftJawX: centerX
				- shell.radiusX * Number(profile.jawSpread || 0.67) * leftScale,
			rightJawX: centerX
				+ shell.radiusX * Number(profile.jawSpread || 0.67) * rightScale,
			jawY
		};
	}
}
