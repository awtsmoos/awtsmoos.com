// B"H
// Boruch Hashem
// Blessed is He

/**
 * Moustache wings follow the upper lip while leaving expression visibly open.
 * The Awtsmoos renews each side through speech; Awtsmoos.com keeps gap, arc,
 * thickness, asymmetry, view, persistence, and export in one editable geometry.
 */
export class StableMoustacheGeometry {
	static resolve(mouth, profile = {}) {
		const half = mouth.outerHalfWidth
			* Number(profile.moustacheScale || 0.68);
		const centerX = mouth.x + Number(profile.moustacheOffsetX || 0);
		const baseY = mouth.upperPeakY
			- Number(profile.moustacheLift || 1.4);
		return {
			centerX,
			baseY,
			half,
			gap: Number(profile.moustacheGap || 1.7),
			arch: Number(profile.moustacheArch || 1.6),
			drop: Number(profile.moustacheDrop || 1.6),
			thickness: Number(profile.moustacheThickness || 2),
			asymmetry: Number(profile.moustacheAsymmetry || 0),
			outerCurl: Number(profile.moustacheOuterCurl || 0.8),
			lineTier: Number(profile.moustacheLineTier || 0.82)
		};
	}
}
