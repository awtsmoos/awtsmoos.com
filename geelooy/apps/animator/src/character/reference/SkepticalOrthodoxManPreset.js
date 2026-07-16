// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterBase } from './ReferenceCharacterBase.js';

/**
 * Gevurah appears as crossed arms, a compressed mouth, and a guarded glance.
 * The Awtsmoos renews every brow and wrist while Awtsmoos.com keeps skepticism
 * as editable acting rather than a frozen silhouette.
 */
export class SkepticalOrthodoxManPreset {
	static id = 'skeptical_orthodox_observer';

	static character() {
		return ReferenceCharacterBase.create({
			id: this.id,
			name: 'Dovid — Skeptical Observer',
			genderPresentation: 'masculine',
			position: { x: 0, y: 225, scale: 0.93, anchor: 'floor' },
			referenceBox: { x: 646, y: 59, width: 253, height: 760, sourceWidth: 1536, sourceHeight: 864 },
			referenceMetrics: { headRX: 35, headRY: 40, shoulderHalf: 43, hipHalf: 27, armWidth: 12, legWidth: 13, shadowRX: 40 },
			bodyProfile: 'guardedAverage',
			expressionProfile: 'skeptical_side_glance',
			emotion: 'skeptical',
			gesture: 'arms_crossed',
			acting: 'guarded_listen',
			beard: true,
			beardStyle: 'tapered_full',
			beardLength: 0.68,
			payos: true,
			payosLength: 0.82,
			payosCurl: 0.72,
			payosThickness: 0.94,
			hatType: 'kippah',
			headwear: { type: 'kippah', size: 1, tilt: 0.02 },
			wardrobeProfile: 'burgundy_shirt_black_trousers',
			colors: {
				jacket: '#7b2f21',
				jacketDark: '#552018',
				jacketLight: '#984333',
				shirt: '#7b2f21',
				innerShirt: '#7b2f21',
				collar: '#7b2f21',
				pants: '#292a2c',
				skin: '#dfa06f',
				skinDark: '#c47c51',
				hair: '#3d2414',
				hairDark: '#1e1009',
				beard: '#3d2414',
				beardDark: '#1e1009',
				hat: '#17181a'
			},
			renderPerformance: {
				face: {
					eyeOpenAmount: 0.58,
					squintAmount: 0.2,
					pupilOffsetX: -0.78,
					pupilOffsetY: 0.05,
					mouthOpenAmount: 0,
					mouthSmileAmount: -0.48,
					browOuter: -0.12,
					browSqueeze: 0.38
				}
			}
		});
	}

	static design() {
		return {
			id: this.id,
			name: 'Dovid — Skeptical Observer',
			genderPresentation: 'masculine',
			pronouns: 'he/him',
			ageGroup: 'adult',
			body: { type: 'average', height: 1, shoulderWidth: 1.06, hipWidth: 1, legLength: 1 },
			face: { shape: 'oval', eyeShape: 'hooded', nose: 'medium', mouth: 'thin', browWeight: 1.18 },
			skin: { color: '#dfa06f', undertone: 'warm', blush: 0.08 },
			hair: { length: 'short', style: 'crop', texture: 'wavy', color: '#3d2414', volume: 0.72 },
			facialHair: { beard: { style: 'full', length: 0.68 }, mustache: { style: 'natural', thickness: 0.72 }, color: '#3d2414' },
			wardrobe: { outerwear: 'none', top: 'shirt', bottom: 'trousers', headwear: 'cap', colors: { outerwear: '#7b2f21', top: '#7b2f21', bottom: '#292a2c', shoes: '#111214', accent: '#552018' } },
			accessories: ['kippah', 'peyot'],
			movement: { profile: 'calm', posture: 'grounded', gestureScale: 0.76 },
			emotion: { default: 'skeptical', intensity: 0.9, traits: ['guarded', 'observant'] },
			position: { x: 0, y: 225 },
			scale: 0.93,
			facing: 'left'
		};
	}
}
