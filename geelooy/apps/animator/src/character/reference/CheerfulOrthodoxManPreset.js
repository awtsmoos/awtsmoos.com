// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterBase } from './ReferenceCharacterBase.js';

/**
 * Chesed becomes visible as an open palm, bright eyes, and an unhidden smile.
 * The Awtsmoos renews every curl and joint while Awtsmoos.com keeps the speaker
 * editable, keyframeable, serializable, and independent of the source image.
 */
export class CheerfulOrthodoxManPreset {
	static id = 'cheerful_orthodox_speaker';

	static character() {
		return ReferenceCharacterBase.create({
			id: this.id,
			name: 'Ari — Cheerful Speaker',
			genderPresentation: 'masculine',
			position: { x: -205, y: 225, scale: 0.94, anchor: 'floor' },
			referenceBox: { x: 81, y: 47, width: 499, height: 773, sourceWidth: 1536, sourceHeight: 864 },
			referenceMetrics: { headRX: 37, headRY: 41, shoulderHalf: 48, hipHalf: 29, armWidth: 13, legWidth: 14, shadowRX: 44 },
			bodyProfile: 'friendlyBroad',
			expressionProfile: 'bright_open_speaker',
			emotion: 'happy',
			gesture: 'open_palm_left',
			acting: 'explain',
			beard: true,
			beardStyle: 'rounded_full',
			beardLength: 0.78,
			payos: true,
			payosLength: 1.08,
			payosCurl: 0.92,
			payosThickness: 1.08,
			hatType: 'kippah',
			headwear: { type: 'kippah', size: 1.04, tilt: -0.03 },
			wardrobeProfile: 'navy_jacket_white_shirt',
			colors: {
				jacket: '#1f3451',
				jacketDark: '#14243b',
				jacketLight: '#35516f',
				shirt: '#fbfbf9',
				innerShirt: '#fbfbf9',
				collar: '#fbfbf9',
				pants: '#252629',
				skin: '#e7ad79',
				skinDark: '#c98255',
				hair: '#5a351a',
				hairDark: '#2d190d',
				beard: '#5a351a',
				beardDark: '#2d190d',
				hat: '#18191b'
			},
			renderPerformance: {
				face: {
					eyeOpenAmount: 1.08,
					pupilOffsetX: 0.18,
					pupilOffsetY: 0,
					mouthOpenAmount: 0.72,
					mouthSmileAmount: 0.9,
					cheekRaiseAmount: 0.48,
					browOuter: 0.25
				}
			}
		});
	}

	static design() {
		return {
			id: this.id,
			name: 'Ari — Cheerful Speaker',
			genderPresentation: 'masculine',
			pronouns: 'he/him',
			ageGroup: 'adult',
			body: { type: 'broad', height: 1, shoulderWidth: 1.12, hipWidth: 1, legLength: 1 },
			face: { shape: 'round', eyeShape: 'wide', nose: 'medium', mouth: 'wide', browWeight: 1.12 },
			skin: { color: '#e7ad79', undertone: 'warm', blush: 0.2 },
			hair: { length: 'short', style: 'curl', texture: 'curly', color: '#5a351a', volume: 0.85 },
			facialHair: { beard: { style: 'full', length: 0.78 }, mustache: { style: 'natural', thickness: 0.8 }, color: '#5a351a' },
			wardrobe: { outerwear: 'jacket', top: 'shirt', bottom: 'trousers', headwear: 'cap', colors: { outerwear: '#1f3451', top: '#fbfbf9', bottom: '#252629', shoes: '#111214', accent: '#35516f' } },
			accessories: ['kippah', 'peyot'],
			movement: { profile: 'energetic', posture: 'upright', gestureScale: 1.15 },
			emotion: { default: 'happy', intensity: 1, traits: ['cheerful', 'expressive'] },
			position: { x: -205, y: 225 },
			scale: 0.94,
			facing: 'right'
		};
	}
}
