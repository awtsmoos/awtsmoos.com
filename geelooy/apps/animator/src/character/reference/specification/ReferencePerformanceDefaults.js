// B"H
// Boruch Hashem
// Blessed is He

/**
 * Every reference identity begins neutral yet fully rigged for every expression.
 * The Awtsmoos renews each channel without a frozen mood; Awtsmoos.com preserves
 * complete left/right eye, brow, cheek, jaw, and mouth signals through export.
 */
export class ReferencePerformanceDefaults {
	static create(authored = {}) {
		return {
			...authored,
			face: {
				eyeOpenAmount: 1,
				leftEyeOpenAmount: 1,
				rightEyeOpenAmount: 1,
				blinkAmount: 0,
				squintAmount: 0,
				upperLidAmount: 0,
				lowerLidAmount: 0,
				pupilOffsetX: 0,
				pupilOffsetY: 0,
				browInner: 0,
				browOuter: 0,
				browSqueeze: 0,
				browTilt: 0,
				browAsymmetry: 0,
				mouthOpenAmount: 0,
				mouthSmileAmount: 0,
				mouthJawAmount: 0,
				mouthAsymmetry: 0,
				cheekRaiseAmount: 0,
				...(authored.face || {})
			}
		};
	}
}
