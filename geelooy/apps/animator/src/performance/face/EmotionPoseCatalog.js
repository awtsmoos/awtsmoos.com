// B"H
// Boruch Hashem
// Blessed is He

/**
 * Every soul may travel through the same complete emotional world. The Awtsmoos
 * renews joy and grief without freezing identity; Awtsmoos.com keeps each pose
 * regional, editable, blendable, serializable, and deterministic in export.
 */
export class EmotionPoseCatalog {
	static all() {
		return {
			neutral: this.pose(),
			calm: this.pose({ eyes: { openness: 0.94 }, mouth: { width: 0.48 } }),
			joy: this.pose({ brows: { outerRaise: 0.24 }, eyes: { openness: 0.9, squint: 0.18 }, mouth: { smile: 0.78, open: 0.18, width: 0.72 }, cheeks: { raise: 0.58 } }),
			amusement: this.pose({ brows: { asymmetry: 0.12 }, eyes: { openness: 0.82, squint: 0.28 }, mouth: { smile: 0.62, open: 0.08, asymmetry: 0.16 }, cheeks: { raise: 0.46 } }),
			skepticism: this.pose({ brows: { outerRaise: -0.16, squeeze: 0.26, tilt: -0.18, asymmetry: 0.24 }, eyes: { openness: 0.78, squint: 0.22, asymmetry: 0.16 }, mouth: { frown: 0.32, press: 0.24, asymmetry: 0.26 } }),
			concern: this.pose({ brows: { innerRaise: 0.42, squeeze: 0.14, tilt: 0.18 }, eyes: { openness: 1.02, lowerLid: 0.12 }, mouth: { frown: 0.32, press: 0.12 }, cheeks: { tension: 0.18 } }),
			anger: this.pose({ brows: { innerRaise: -0.42, outerRaise: -0.28, squeeze: 0.72, tilt: -0.38 }, eyes: { openness: 0.72, squint: 0.32 }, mouth: { frown: 0.58, press: 0.42, jaw: 0.18 }, cheeks: { tension: 0.56 }, nose: { wrinkle: 0.32 } }),
			sadness: this.pose({ brows: { innerRaise: 0.56, outerRaise: -0.24, tilt: 0.34 }, eyes: { openness: 0.74, upperLid: 0.18 }, mouth: { frown: 0.56, width: 0.42 }, cheeks: { tension: 0.14 } }),
			surprise: this.pose({ brows: { innerRaise: 0.62, outerRaise: 0.72 }, eyes: { openness: 1.2 }, mouth: { open: 0.72, jaw: 0.68, round: 0.62, width: 0.38 } }),
			embarrassment: this.pose({ brows: { innerRaise: 0.18, asymmetry: 0.16 }, eyes: { openness: 0.72, dartX: -0.16, dartY: 0.1 }, mouth: { smile: 0.18, press: 0.26, asymmetry: 0.18 }, cheeks: { blush: 0.72 } }),
			fatigue: this.pose({ brows: { outerRaise: -0.18 }, eyes: { openness: 0.52, upperLid: 0.38 }, mouth: { open: 0.08, frown: 0.12, width: 0.44 }, cheeks: { tension: 0.08 } }),
			attention: this.pose({ brows: { innerRaise: 0.12, outerRaise: 0.08 }, eyes: { openness: 1.04 }, mouth: { press: 0.08, width: 0.48 } }),
			fear: this.pose({ brows: { innerRaise: 0.62, outerRaise: 0.38, squeeze: 0.16 }, eyes: { openness: 1.18 }, mouth: { open: 0.42, jaw: 0.36, width: 0.44 }, cheeks: { tension: 0.44 } }),
			disgust: this.pose({ brows: { innerRaise: -0.2, squeeze: 0.42, asymmetry: 0.12 }, eyes: { openness: 0.68, squint: 0.28 }, mouth: { frown: 0.42, press: 0.34, asymmetry: 0.2 }, nose: { wrinkle: 0.72 } }),
			determination: this.pose({ brows: { innerRaise: -0.18, squeeze: 0.38 }, eyes: { openness: 0.84, squint: 0.12 }, mouth: { press: 0.38, width: 0.56 }, cheeks: { tension: 0.28 } }),
			relief: this.pose({ brows: { innerRaise: 0.08, outerRaise: 0.1 }, eyes: { openness: 0.72, upperLid: 0.16 }, mouth: { smile: 0.32, width: 0.54 }, cheeks: { raise: 0.18 } })
		};
	}

	static pose(overrides = {}) {
		return {
			brows: { innerRaise: 0, outerRaise: 0, squeeze: 0, tilt: 0, asymmetry: 0, ...(overrides.brows || {}) },
			eyes: { openness: 1, leftOpenness: 1, rightOpenness: 1, squint: 0, blink: 0, dartX: 0, dartY: 0, upperLid: 0, lowerLid: 0, asymmetry: 0, ...(overrides.eyes || {}) },
			mouth: { open: 0, smile: 0, frown: 0, jaw: 0, width: 0.5, round: 0, press: 0, asymmetry: 0, teeth: 0, tongue: 0, ...(overrides.mouth || {}) },
			cheeks: { raise: 0, tension: 0, blush: 0, ...(overrides.cheeks || {}) },
			nose: { wrinkle: 0, ...(overrides.nose || {}) }
		};
	}
}
