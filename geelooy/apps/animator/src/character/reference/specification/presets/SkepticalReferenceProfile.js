// B"H
// Boruch Hashem
// Blessed is He

import { SkepticalReferenceBodyGeometry } from './SkepticalReferenceBodyGeometry.js';

/**
 * Dovid's guarded body, burgundy wardrobe, and folded-arm pose form one profile.
 * The Awtsmoos renews restraint without rigidity, while Awtsmoos.com separates
 * body identity from facial geometry so both remain editable and verifiable.
 */
export class SkepticalReferenceProfile {
	static character() {
		return {
			measurements: {
				body: {
					headWidth: 0.235,
					headHeight: 0.26,
					shoulderWidth: 0.305,
					hipWidth: 0.19,
					armWidth: 0.047,
					legWidth: 0.048,
					waistY: 0.56,
					hipY: 0.665
				},
				style: {
					outerLineWidth: 0.011,
					innerLineWidth: 0.006,
					shadowWidth: 0.27
				}
			},
			referenceMetrics: {
				headRX: 36,
				headRY: 41,
				shoulderHalf: 44,
				hipHalf: 27,
				armWidth: 12,
				legWidth: 13,
				shadowRX: 41
			},
			bodyGeometry: SkepticalReferenceBodyGeometry.create(),
			bodyProfile: 'guardedAverage',
			expressionProfile: 'skeptical_side_glance',
			motion: 'skeptical',
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
			wardrobeProfile: 'burgundy_shirt_black_trousers',
			rigPose: this.pose(),
			colors: this.colors()
		};
	}

	static pose() {
		return {
			body: { torsoLean: 1.5, headNod: 1.5 },
			arms: {
				left: { shoulderLift: 0, elbowX: 18, elbowY: 23, handX: -43, handY: 1, handPose: 'hold' },
				right: { shoulderLift: 1, elbowX: 19, elbowY: 26, handX: -43, handY: -4, handPose: 'hold' }
			}
		};
	}

	static colors() {
		return {
			jacket: '#7b2f21', jacketDark: '#552018', jacketLight: '#984333',
			shirt: '#7b2f21', innerShirt: '#7b2f21', collar: '#7b2f21',
			pants: '#292a2c', skin: '#dfa06f', skinDark: '#c47c51',
			hair: '#3d2414', hairDark: '#1e1009', beard: '#3d2414',
			beardDark: '#1e1009', hat: '#17181a'
		};
	}
}
