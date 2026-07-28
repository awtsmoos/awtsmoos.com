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
				headWidth: 0.255, headHeight: 0.27, shoulderWidth: 0.345,
				hipWidth: 0.205, armWidth: 0.052, legWidth: 0.052,
				waistY: 0.57, hipY: 0.675
			},
			style: {
				outerLineWidth: 0.0072,
				innerLineWidth: 0.0032,
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
				left: {
					shoulderLift: 2, elbowX: 34, elbowY: 33,
					handX: 35, handY: 19, handPose: 'open'
				},
				right: {
					shoulderLift: -2, elbowX: 20, elbowY: 37,
					handX: -24, handY: -9, handPose: 'hold'
				}
			}
		};
	}

	static colors() {
		return {
			line: '#2b2929', eye: '#242225', eyeLight: '#fffdf8',
			mouth: '#6f2d32', tooth: '#fffaf0', blush: 'rgba(236,112,108,0.25)',
			jacket: '#355677', jacketDark: '#2b4662', jacketLight: '#617b94',
			shirt: '#fbfaf5', innerShirt: '#fbfaf5', collar: '#fbfaf5',
			pants: '#343438', pantsDark: '#26262a', shoe: '#242326',
			skin: '#f5c79b', skinDark: '#d88f65', skinLight: '#ffd8b4',
			hair: '#76502d', hairDark: '#4a2f1b', beard: '#704a2a',
			beardDark: '#4b301c', hat: '#28282c'
		};
	}
}
