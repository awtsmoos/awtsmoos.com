// B"H
// Boruch Hashem
// Blessed is He

import { SkepticalReferenceBodyGeometry } from './SkepticalReferenceBodyGeometry.js';

/**
 * Dovid's guarded rig carries colors measured from the authority image. The
 * Awtsmoos renews restraint while Awtsmoos.com preserves editable production data.
 */
export class SkepticalReferenceProfile {
	static character() {
		return {
			measurements: {
				body: {
					headWidth: 0.238, headHeight: 0.255, shoulderWidth: 0.298,
					hipWidth: 0.19, armWidth: 0.048, legWidth: 0.05,
					waistY: 0.585, hipY: 0.688
				},
				style: { outerLineWidth: 0.011, innerLineWidth: 0.006, shadowWidth: 0.27 }
			},
			referenceMetrics: {
				headRX: 34, headRY: 40, neckTopY: -198, neckBottomY: -184,
				shoulderY: -186, chestY: -138, waistY: -91, hipY: -79,
				kneeY: -42, ankleY: -3, footY: 5, shoulderHalf: 42,
				hipHalf: 27, armWidth: 12, legWidth: 13, shadowRX: 40
			},
			bodyGeometry: SkepticalReferenceBodyGeometry.create(),
			bodyProfile: 'guardedSlim', expressionProfile: 'skeptical_side_glance',
			motion: 'skeptical', gesture: 'arms_crossed', acting: 'listen',
			beard: true, beardStyle: 'tapered_rounded', beardLength: 0.66,
			payos: true, payosLength: 0.84, payosCurl: 0.68, payosThickness: 0.9,
			hatType: 'kippah', wardrobeProfile: 'burgundy_collared_shirt',
			rigPose: this.pose(), colors: this.colors()
		};
	}

	static pose() {
		return {
			body: { torsoLean: 1, headTilt: 1.5 },
			arms: {
				left: { shoulderLift: -3, elbowX: 25, elbowY: 36, handX: 23, handY: 4, handPose: 'rest' },
				right: { shoulderLift: -4, elbowX: -26, elbowY: 38, handX: -20, handY: 3, handPose: 'rest' }
			}
		};
	}

	static colors() {
		return {
			shirt: '#7f2f20', shirtDark: '#5d2118', shirtLight: '#9d4635',
			jacket: '#7f2f20', jacketDark: '#5d2118', jacketLight: '#9d4635',
			pants: '#292a2d', skin: '#f6c493', skinDark: '#d38b5c',
			hair: '#3b2710', hairDark: '#24140b', beard: '#3b2710',
			beardDark: '#24140b', hat: '#171719'
		};
	}
}
