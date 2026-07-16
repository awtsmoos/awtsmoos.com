// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterBase } from './ReferenceCharacterBase.js';

/**
 * Tiferes appears as a calm gaze, modest silhouette, and balanced stillness.
 * The Awtsmoos renews each eye, earring, fold, and pocketed hand while
 * Awtsmoos.com preserves the woman as editable original animation geometry.
 */
export class CalmOrthodoxWomanPreset {
	static id = 'calm_orthodox_woman';

	static character() {
		return ReferenceCharacterBase.create({
			id: this.id,
			name: 'Miriam — Calm Observer',
			genderPresentation: 'feminine',
			position: { x: 205, y: 225, scale: 0.9, anchor: 'floor' },
			referenceBox: { x: 1083, y: 94, width: 239, height: 725, sourceWidth: 1536, sourceHeight: 864 },
			referenceMetrics: { headRX: 32, headRY: 38, shoulderHalf: 36, hipHalf: 27, armWidth: 10, legWidth: 11, shadowRX: 37 },
			bodyProfile: 'gracefulAverage',
			expressionProfile: 'calm_side_attention',
			emotion: 'calm',
			gesture: 'right_hand_in_pocket',
			acting: 'listen_idle',
			hatType: 'head_wrap',
			headwear: { type: 'head_wrap', size: 1.02, bun: true },
			earrings: true,
			skirt: true,
			skirtLength: 1.08,
			wardrobeProfile: 'olive_overshirt_black_dress',
			colors: {
				jacket: '#536238',
				jacketDark: '#30391f',
				jacketLight: '#71804d',
				shirt: '#17181a',
				innerShirt: '#17181a',
				collar: '#536238',
				pants: '#17181a',
				skirt: '#17181a',
				skin: '#dfa477',
				skinDark: '#c57d55',
				hair: '#322018',
				hairDark: '#17100d',
				hat: '#161719',
				earring: '#e5b33f'
			},
			renderPerformance: {
				face: {
					eyeOpenAmount: 0.92,
					pupilOffsetX: -0.58,
					pupilOffsetY: 0,
					mouthOpenAmount: 0,
					mouthSmileAmount: 0.22,
					cheekRaiseAmount: 0.08,
					browOuter: 0.08
				}
			}
		});
	}

	static design() {
		return {
			id: this.id,
			name: 'Miriam — Calm Observer',
			genderPresentation: 'feminine',
			pronouns: 'she/her',
			ageGroup: 'adult',
			body: { type: 'average', height: 0.98, shoulderWidth: 0.94, hipWidth: 1.04, legLength: 0.96 },
			face: { shape: 'oval', eyeShape: 'almond', nose: 'small', mouth: 'full', browWeight: 0.88 },
			skin: { color: '#dfa477', undertone: 'warm', blush: 0.16 },
			hair: { length: 'long', style: 'bun', texture: 'wavy', color: '#322018', volume: 0.82 },
			facialHair: { beard: { style: 'none', length: 0 }, mustache: { style: 'none', thickness: 0 }, color: '#322018' },
			wardrobe: { outerwear: 'jacket', top: 'blouse', bottom: 'skirt', headwear: 'scarf', colors: { outerwear: '#536238', top: '#17181a', bottom: '#17181a', shoes: '#111214', accent: '#71804d' } },
			accessories: ['head_wrap', 'gold_earrings'],
			movement: { profile: 'gentle', posture: 'relaxed', gestureScale: 0.72 },
			emotion: { default: 'calm', intensity: 0.76, traits: ['calm', 'observant'] },
			position: { x: 205, y: 225 },
			scale: 0.9,
			facing: 'left'
		};
	}
}
