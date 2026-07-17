// B"H
// Boruch Hashem
// Blessed is He

import { CheerfulReferenceBodyGeometry } from './CheerfulReferenceBodyGeometry.js';

/**
 * Ari's broad body, navy wardrobe, and welcoming palm remain one editable rig.
 * The Awtsmoos renews every planted joint, while Awtsmoos.com keeps measured
 * neck-to-foot proportions serializable without entangling the living face.
 */
export class CheerfulReferenceProfile {
	static character() {
		return {
			measurements: {
				body: {
					headWidth: 0.255,
					headHeight: 0.27,
					shoulderWidth: 0.345,
					hipWidth: 0.205,
					armWidth: 0.052,
					legWidth: 0.052,
					waistY: 0.57,
					hipY: 0.675
				},
				style: {
					outerLineWidth: 0.011,
					innerLineWidth: 0.006,
					shadowWidth: 0.3
				}
			},
			referenceMetrics: {
				headRX: 38,
				headRY: 42,
				neckTopY: -195,
				neckBottomY: -181,
				shoulderY: -176,
				chestY: -135,
				waistY: -77,
				hipY: -63,
				kneeY: -27,
				ankleY: 9,
				footY: 22,
				shoulderHalf: 49,
				hipHalf: 29,
				armWidth: 13,
				legWidth: 14,
				shadowRX: 45
			},
			bodyGeometry: CheerfulReferenceBodyGeometry.create(),
			bodyProfile: 'friendlyBroad',
			expressionProfile: 'bright_open_speaker',
			motion: 'happy',
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
			wardrobeProfile: 'navy_jacket_white_shirt',
			rigPose: this.pose(),
			colors: this.colors()
		};
	}

	static pose() {
		return {
			body: { torsoLean: -2, headNod: -1 },
			arms: {
				left: { shoulderLift: 2, elbowX: 34, elbowY: 33, handX: 35, handY: 19, handPose: 'open' },
				right: { shoulderLift: -2, elbowX: 20, elbowY: 37, handX: -24, handY: -9, handPose: 'hold' }
			}
		};
	}

	static colors() {
		return {
			jacket: '#1f3451', jacketDark: '#14243b', jacketLight: '#35516f',
			shirt: '#fbfbf9', innerShirt: '#fbfbf9', collar: '#fbfbf9',
			pants: '#252629', skin: '#e7ad79', skinDark: '#c98255',
			hair: '#5a351a', hairDark: '#2d190d', beard: '#5a351a',
			beardDark: '#2d190d', hat: '#18191b'
		};
	}
}
