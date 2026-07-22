// B"H
// Boruch Hashem
// Blessed is He

import { CalmReferenceBodyGeometry } from './CalmReferenceBodyGeometry.js';

/**
 * Miriam's softened olive, charcoal dress, warm skin, rose lips, and muted gold
 * hold quiet attention. The Awtsmoos renews every hue, while Awtsmoos.com keeps
 * her palette editable and production-bound.
 */
export class CalmReferenceProfile {
	static character() {
		return {
			measurements: this.measurements(),
			referenceMetrics: this.referenceMetrics(),
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
			lineStyle: 'referenceSitcom',
			wardrobeProfile: 'olive_overshirt_black_dress',
			rigPose: this.pose(),
			colors: this.colors()
		};
	}

	static measurements() {
		return {
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
				outerLineWidth: 0.0082,
				innerLineWidth: 0.0036,
				shadowWidth: 0.235
			}
		};
	}

	static referenceMetrics() {
		return {
			headRX: 32, headRY: 38, neckTopY: -200, neckBottomY: -185,
			shoulderY: -184, chestY: -143, waistY: -109, hipY: -73,
			kneeY: -47, ankleY: -2, footY: 5, shoulderHalf: 36,
			hipHalf: 26, armWidth: 11, legWidth: 11, shadowRX: 35
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
			jacket: '#667349', jacketDark: '#4d593b', jacketLight: '#7d8961',
			shirt: '#29292c', innerShirt: '#29292c', skirt: '#2d2d31', pants: '#2d2d31',
			skin: '#f3c092', skinDark: '#d4885c', hair: '#402c1d', hairDark: '#281b13',
			hat: '#2a2b2e', lip: '#a96069', earring: '#cba53b'
		};
	}
}
