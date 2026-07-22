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
			lineStyle: 'referenceSitcom',
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
				outerLineWidth: 0.0086,
				innerLineWidth: 0.0039,
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
			jacket: '#2c4a6b', jacketDark: '#233b56', jacketLight: '#526d87',
			shirt: '#fbfaf7', innerShirt: '#fbfaf7', collar: '#fbfaf7',
			pants: '#303034', skin: '#f6c99c', skinDark: '#d99064',
			hair: '#714a28', hairDark: '#3c2514', beard: '#704725',
			beardDark: '#402716', hat: '#202124'
		};
	}
}
