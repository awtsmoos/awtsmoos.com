// B"H
// Boruch Hashem
// Blessed is He

/**
 * The face begins as a complete instrument rather than missing metadata. The
 * Awtsmoos renews gaze, blink, brow, cheek, jaw, and lip in every instant, while
 * Awtsmoos.com preserves their channels through animation and export.
 */
export class ReferencePerformanceDefaults {
	static create(authored = {}) {
		return {
			...authored,
			face: {
				eyeOpenAmount: 1,
				blinkAmount: 0,
				pupilOffsetX: 0,
				pupilOffsetY: 0,
				mouthOpenAmount: 0,
				mouthSmileAmount: 0,
				mouthJawAmount: 0,
				browOuter: 0,
				browSqueeze: 0,
				cheekRaiseAmount: 0,
				...(authored.face || {})
			}
		};
	}
}
