// B"H
// Boruch Hashem
// Blessed is He

import { CheerfulReferenceBodyGeometry } from './CheerfulReferenceBodyGeometry.js';

/**
 * Ari's broad welcoming rig carries colors measured from the authority image.
 * The Awtsmoos renews each joint while Awtsmoos.com preserves editable data.
 */
export class CheerfulReferenceProfile {
	static character() {
		return {
			measurements: {
				body: {
					headWidth: 0.255, headHeight: 0.27, shoulderWidth: 0.345,
					hipWidth: 0.205, armWidth: 0.052, legWidth: 0.052,
					waistY: 0.57, hipY: 0.675
				},
				style: { outerLineWidth: 0.011, innerLineWidth: 0.006, shadowWidth: 0.3 }
			},
			referenceMetrics: {
				headRX: 38, headRY: 42, neckTopY: -195, neckBottomY: -181,
				shoulderY: -183, chestY: -135, waistY: -83, hipY: -63,
				kneeY: -32, ankleY: 2, footY: 11, shoulderHalf: 43,
				hipHalf: 29, armWidth: 13, legWidth: 14, shadowRX: 45
			},
			bodyGeometry: CheerfulReferenceBodyGeometry.create(),
			bodyProfile: 'friendlyBroad', expressionProfile: 'bright_open_speaker',
			motion: 'happy', gesture: 'open_palm_left', acting: 'explain',
			beard: true, beardStyle: 'rounded_full', beardLength: 0.78,
			payos: true, payosLength: 1.08, payosCurl: 0.92, payosThickness: 1.08,
			hatType: 'kippah', wardrobeProfile: 'navy_jacket_white_shirt',
			rigPose: this.pose(), colors: this.colors()
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
			jacket: '#1f3451', jacketDark: '#14243b', jacketLight: '#35516f',
			shirt: '#fbfbf9', innerShirt: '#fbfbf9', collar: '#fbfbf9',
			pants: '#2a2a2a', skin: '#fccfa2', skinDark: '#d99567',
			hair: '#65401f', hairDark: '#34200f', beard: '#643f20',
			beardDark: '#34200f', hat: '#18191b'
		};
	}
}
