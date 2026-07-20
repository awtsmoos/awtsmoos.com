// B"H
// Boruch Hashem
// Blessed is He

import { CalmReferenceBodyGeometry } from './CalmReferenceBodyGeometry.js';

/**
 * Miriam's weighted rig carries colors measured from the authority image. The
 * Awtsmoos renews quiet life while Awtsmoos.com preserves serializable controls.
 */
export class CalmReferenceProfile {
	static character() {
		return {
			measurements: {
				body: {
					headWidth: 0.23, headHeight: 0.245, shoulderWidth: 0.25,
					hipWidth: 0.19, armWidth: 0.042, legWidth: 0.04,
					waistY: 0.595, hipY: 0.696
				},
				style: { outerLineWidth: 0.01, innerLineWidth: 0.0055, shadowWidth: 0.235 }
			},
			referenceMetrics: {
				headRX: 32, headRY: 38, neckTopY: -200, neckBottomY: -185,
				shoulderY: -184, chestY: -143, waistY: -109, hipY: -73,
				kneeY: -47, ankleY: -2, footY: 5, shoulderHalf: 36,
				hipHalf: 26, armWidth: 11, legWidth: 11, shadowRX: 35
			},
			bodyGeometry: CalmReferenceBodyGeometry.create(),
			bodyProfile: 'modestBalanced', expressionProfile: 'calm_attentive',
			motion: 'calm', gesture: 'right_hand_in_pocket', acting: 'listen',
			skirt: true, earrings: true, beard: false, payos: false,
			hatType: 'head_wrap', wardrobeProfile: 'olive_overshirt_black_dress',
			rigPose: this.pose(), colors: this.colors()
		};
	}

	static pose() {
		return {
			body: { torsoLean: -0.5, headTilt: -1 },
			arms: {
				left: { shoulderLift: -2, elbowX: 6, elbowY: 43, handX: 1, handY: 42, handPose: 'rest' },
				right: { shoulderLift: -4, elbowX: 13, elbowY: 31, handX: 10, handY: 7, handPose: 'pocket' }
			}
		};
	}

	static colors() {
		return {
			jacket: '#565e35', jacketDark: '#3f4d2e', jacketLight: '#707a4a',
			shirt: '#1d1d1d', innerShirt: '#1d1d1d', skirt: '#1d1d1d', pants: '#1d1d1d',
			skin: '#fcc594', skinDark: '#d58b5d', hair: '#2d2117', hairDark: '#1d1510',
			hat: '#252525', lip: '#a94f55', earring: '#d6a62a'
		};
	}
}
