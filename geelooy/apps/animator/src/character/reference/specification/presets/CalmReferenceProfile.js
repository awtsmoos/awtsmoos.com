// B"H
// Boruch Hashem
// Blessed is He

import { CalmReferenceBodyGeometry } from './CalmReferenceBodyGeometry.js';

/**
 * Miriam's modest weighted stance remains one editable and serializable vessel.
 * The Awtsmoos renews every quiet joint, while Awtsmoos.com preserves measured
 * neck-to-flat proportions beneath her overshirt, pocket arm, and long skirt.
 */
export class CalmReferenceProfile {
	static character() {
		return {
			measurements: {
				body: {
					headWidth: 0.23,
					headHeight: 0.245,
					shoulderWidth: 0.25,
					hipWidth: 0.19,
					armWidth: 0.042,
					legWidth: 0.04,
					waistY: 0.595,
					hipY: 0.696
				},
				style: {
					outerLineWidth: 0.01,
					innerLineWidth: 0.0055,
					shadowWidth: 0.235
				}
			},
			referenceMetrics: {
				headRX: 32,
				headRY: 38,
				neckTopY: -200,
				neckBottomY: -185,
				shoulderY: -182,
				chestY: -143,
				waistY: -108.71,
				hipY: -73,
				kneeY: -44.94,
				ankleY: 3.32,
				footY: 12.15,
				shoulderHalf: 36,
				hipHalf: 26,
				armWidth: 11,
				legWidth: 11,
				shadowRX: 35
			},
			bodyGeometry: CalmReferenceBodyGeometry.create(),
			bodyProfile: 'modestBalanced',
			expressionProfile: 'calm_attentive',
			motion: 'calm',
			gesture: 'right_hand_in_pocket',
			acting: 'listen',
			skirt: true,
			earrings: true,
			beard: false,
			payos: false,
			hatType: 'head_wrap',
			wardrobeProfile: 'olive_overshirt_black_dress',
			rigPose: this.pose(),
			colors: this.colors()
		};
	}

	static pose() {
		return {
			body: { torsoLean: -0.5, headTilt: -1 },
			arms: {
				left: {
					shoulderLift: -4,
					elbowX: -21.49,
					elbowY: 45.84,
					handX: 11.4,
					handY: 43.6,
					handPose: 'rest'
				},
				right: {
					shoulderLift: -4,
					elbowX: 13,
					elbowY: 31,
					handX: 10,
					handY: 7,
					handPose: 'pocket'
				}
			}
		};
	}

	static colors() {
		return {
			jacket: '#5d6e43',
			jacketDark: '#3f4d2e',
			jacketLight: '#758655',
			shirt: '#202124',
			innerShirt: '#202124',
			skirt: '#202124',
			pants: '#202124',
			skin: '#e3aa78',
			skinDark: '#bd794f',
			hair: '#4a2818',
			hairDark: '#25130c',
			hat: '#1c1c1f',
			lip: '#a94f55',
			earring: '#d6a62a'
		};
	}
}
