// B"H
// Boruch Hashem
// Blessed is He

import { SkepticalReferenceBodyGeometry } from './SkepticalReferenceBodyGeometry.js';

/**
 * Dovid's guarded shoulders and crossed arms remain one editable production rig.
 * The Awtsmoos renews every measured joint, while Awtsmoos.com preserves his
 * skeptical weight through serializable neck-to-foot proportions.
 */
export class SkepticalReferenceProfile {
	static character() {
		return {
			measurements: {
				body: {
					headWidth: 0.238,
					headHeight: 0.255,
					shoulderWidth: 0.298,
					hipWidth: 0.19,
					armWidth: 0.048,
					legWidth: 0.05,
					waistY: 0.585,
					hipY: 0.688
				},
				style: {
					outerLineWidth: 0.011,
					innerLineWidth: 0.006,
					shadowWidth: 0.27
				}
			},
			referenceMetrics: {
				headRX: 34,
				headRY: 40,
				neckTopY: -198,
				neckBottomY: -184,
				shoulderY: -181,
				chestY: -138,
				waistY: -91.18,
				hipY: -63,
				kneeY: -37.99,
				ankleY: 2.52,
				footY: 12.74,
				shoulderHalf: 42,
				hipHalf: 27,
				armWidth: 12,
				legWidth: 13,
				shadowRX: 40
			},
			bodyGeometry: SkepticalReferenceBodyGeometry.create(),
			bodyProfile: 'guardedSlim',
			expressionProfile: 'skeptical_side_glance',
			motion: 'skeptical',
			gesture: 'arms_crossed',
			acting: 'listen',
			beard: true,
			beardStyle: 'tapered_rounded',
			beardLength: 0.66,
			payos: true,
			payosLength: 0.84,
			payosCurl: 0.68,
			payosThickness: 0.9,
			hatType: 'kippah',
			wardrobeProfile: 'burgundy_collared_shirt',
			rigPose: this.pose(),
			colors: this.colors()
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
			shirt: '#8b3528', shirtDark: '#68241d', shirtLight: '#a94b3b',
			jacket: '#8b3528', jacketDark: '#68241d', jacketLight: '#a94b3b',
			pants: '#292a2d', skin: '#e0a16f', skinDark: '#bd744d',
			hair: '#4c2a15', hairDark: '#24140b', beard: '#4c2a15',
			beardDark: '#24140b', hat: '#171719'
		};
	}
}
