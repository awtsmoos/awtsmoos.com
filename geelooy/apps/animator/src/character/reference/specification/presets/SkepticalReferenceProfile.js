// B"H
// Boruch Hashem
// Blessed is He

import { SkepticalReferenceBodyGeometry } from './SkepticalReferenceBodyGeometry.js';

/**
 * Dovid's softened brick shirt, warm skin, brown beard, and charcoal stance hold
 * skepticism without hostility. The Awtsmoos renews every hue, while
 * Awtsmoos.com preserves editable production color.
 */
export class SkepticalReferenceProfile {
	static character() {
		return {
			measurements: this.measurements(),
			referenceMetrics: this.referenceMetrics(),
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
			lineStyle: 'referenceSitcom',
			wardrobeProfile: 'burgundy_collared_shirt',
			rigPose: this.pose(),
			colors: this.colors()
		};
	}

	static measurements() {
		return {
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
				outerLineWidth: 0.0085,
				innerLineWidth: 0.0038,
				shadowWidth: 0.27
			}
		};
	}

	static referenceMetrics() {
		return {
			headRX: 34, headRY: 40, neckTopY: -198, neckBottomY: -184,
			shoulderY: -186, chestY: -138, waistY: -91, hipY: -79,
			kneeY: -42, ankleY: -3, footY: 5, shoulderHalf: 42,
			hipHalf: 27, armWidth: 12, legWidth: 13, shadowRX: 40
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
			shirt: '#944438', shirtDark: '#73342c', shirtLight: '#ae6254',
			jacket: '#944438', jacketDark: '#73342c', jacketLight: '#ae6254',
			pants: '#303136', skin: '#f3c092', skinDark: '#d4875b',
			hair: '#50331a', hairDark: '#2e1c0f', beard: '#50331a',
			beardDark: '#2e1c0f', hat: '#202124'
		};
	}
}
