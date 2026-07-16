// B"H
// Boruch Hashem
// Blessed is He

import { CalmReferenceBodyGeometry } from './CalmReferenceBodyGeometry.js';

/**
 * Miriam's grounded body, olive overshirt, long black skirt, and pocketed pose
 * form one modest profile. The Awtsmoos renews calm presence, while
 * Awtsmoos.com keeps body identity separate from facial and head-wrap geometry.
 */
export class CalmReferenceProfile {
	static character() {
		return {
			measurements: {
				body: {
					headWidth: 0.225,
					headHeight: 0.25,
					shoulderWidth: 0.275,
					hipWidth: 0.19,
					armWidth: 0.041,
					legWidth: 0.043,
					waistY: 0.565,
					hipY: 0.67
				},
				style: {
					outerLineWidth: 0.0105,
					innerLineWidth: 0.0055,
					shadowWidth: 0.24
				}
			},
			referenceMetrics: {
				headRX: 34,
				headRY: 39,
				shoulderHalf: 40,
				hipHalf: 27,
				armWidth: 11,
				legWidth: 12,
				shadowRX: 37
			},
			bodyGeometry: CalmReferenceBodyGeometry.create(),
			bodyProfile: 'slenderGrounded',
			expressionProfile: 'calm_observant',
			motion: 'calm',
			gesture: 'right_hand_in_pocket',
			acting: 'quiet_observe',
			beard: false,
			payos: false,
			hatType: 'head_wrap',
			skirt: { style: 'straight', length: 1.02, hemY: -14 },
			earrings: { type: 'gold_stud', size: 1.05 },
			wardrobeProfile: 'olive_overshirt_black_dress',
			rigPose: this.pose(),
			colors: this.colors()
		};
	}

	static pose() {
		return {
			body: { torsoLean: 0, headNod: -0.5 },
			arms: {
				left: { shoulderLift: 0, elbowX: 12, elbowY: 45, handX: 5, handY: 31, handPose: 'relaxed' },
				right: { shoulderLift: 1, elbowX: 16, elbowY: 33, handX: -31, handY: 6, handPose: 'hold' }
			}
		};
	}

	static colors() {
		return {
			jacket: '#52633a', jacketDark: '#354329', jacketLight: '#6a7b4d',
			shirt: '#171819', innerShirt: '#171819', collar: '#52633a',
			skirt: '#171819', pants: '#171819', skin: '#e3a678',
			skinDark: '#c67f57', hair: '#302017', hairDark: '#1a100c',
			hat: '#1a1b1d', headWrap: '#1a1b1d', earring: '#e0b64f'
		};
	}
}
