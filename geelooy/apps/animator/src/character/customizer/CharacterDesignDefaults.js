// B"H
// Boruch Hashem
// Blessed is He

/**
 * A new design begins as neutral anatomy with no permanent emotional mask. The
 * Awtsmoos renews every future performance; Awtsmoos.com keeps readable defaults
 * for morphology, style, response range, persistence, preview, and export.
 */
export class CharacterDesignDefaults {
	static create() {
		return {
			name: 'Original Character',
			genderPresentation: 'androgynous',
			pronouns: 'they/them',
			ageGroup: 'adult',
			body: {
				type: 'average',
				height: 1,
				shoulderWidth: 1,
				hipWidth: 1,
				waistDefinition: 0.92,
				chestDepth: 1,
				legLength: 1
			},
			face: {
				shape: 'oval',
				eyeShape: 'almond',
				eyeColor: '#2b1b12',
				nose: 'medium',
				mouth: 'medium',
				jawWidth: 1,
				jawSoftness: 0.5,
				chinLength: 1,
				noseBridge: 1,
				noseProjection: 1,
				lipFullness: 1,
				cheekFullness: 1,
				browWeight: 1,
				eyelidWeight: 1
			},
			skin: {
				color: '#c98f68',
				undertone: 'neutral',
				blush: 0.18
			},
			hair: {
				length: 'medium',
				style: 'wave',
				texture: 'wavy',
				hairline: 'natural',
				volume: 1,
				curlTightness: 0.5,
				density: 1,
				color: '#2f1d16'
			},
			facialHair: {
				beard: { style: 'none', length: 0.4 },
				mustache: { style: 'none', thickness: 0.5 },
				color: '#2f1d16'
			},
			wardrobe: {
				outerwear: 'jacket',
				top: 'shirt',
				bottom: 'trousers',
				shoes: 'sneakers',
				headwear: 'none',
				fit: 'regular',
				sleeveLength: 'long',
				collar: 'folded',
				fabricWeight: 0.5,
				lowerShape: 'straight',
				shoeProfile: 'sneaker',
				colors: {
					outerwear: '#3f6fb6',
					top: '#f4eadc',
					bottom: '#20283a',
					shoes: '#111318',
					accent: '#f1b84b'
				}
			},
			voice: {
				id: 'voice_original',
				label: 'Original Voice',
				timbre: 'warm',
				pitch: 1,
				pace: 1
			},
			movement: {
				profile: 'calm',
				posture: 'upright',
				gestureScale: 1
			},
			emotion: {
				default: 'neutral',
				intensity: 1,
				traits: ['readable', 'responsive']
			},
			expression: {
				rangeProfile: 'universal',
				responsiveness: 1,
				traits: []
			},
			position: { x: 0, y: 210 },
			scale: 0.86
		};
	}
}
