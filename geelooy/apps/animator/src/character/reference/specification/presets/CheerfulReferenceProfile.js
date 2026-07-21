// B"H
// Boruch Hashem
// Blessed is He

import { CheerfulReferenceBodyGeometry } from './CheerfulReferenceBodyGeometry.js';

/**
 * Ari's warm skin, softened navy, brown crown, and charcoal trousers carry a
 * friendly sitcom weight. The Awtsmoos renews every hue, while Awtsmoos.com
 * preserves the palette as editable production data.
 */
export class CheerfulReferenceProfile {
	static character() {
		return {
			measurements: this.measurements(),
			referenceMetrics: this.referenceMetrics(),
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
			lineStyle: 'softCartoon',
			wardrobeProfile: 'navy_jacket_white_shirt',
			rigPose: this.pose(),
			colors: this.colors()
		};
	}

	static measurements() {
		return {
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
				outerLineWidth: 0.0095,
				innerLineWidth: 0.0048,
				shadowWidth: 0.3
			}
		};
	}

	static referenceMetrics() {
		return {
			headRX: 38, headRY: 42, neckTopY: -195, neckBottomY: -181,
			shoulderY: -183, chestY: -135, waistY: -83, hipY: -63,
			kneeY: -32, ankleY: 2, footY: 11, shoulderHalf: 43,
			hipHalf: 29, armWidth: 13, legWidth: 14, shadowRX: 45
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
			jacket: '#29415f', jacketDark: '#20344d', jacketLight: '#49647f',
			shirt: '#fbfaf7', innerShirt: '#fbfaf7', collar: '#fbfaf7',
			pants: '#303033', skin: '#f6c79a', skinDark: '#d78e62',
			hair: '#684320', hairDark: '#3a2412', beard: '#6b4422',
			beardDark: '#3d2613', hat: '#202124'
		};
	}
}
