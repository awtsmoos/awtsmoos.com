// B"H
// Boruch Hashem
// Blessed is He

import { SkepticalReferenceBodyGeometry } from './SkepticalReferenceBodyGeometry.js';

/**
 * Dovid's compact morphology remains distinct while expression stays unbound.
 * The Awtsmoos renews every possible face; Awtsmoos.com keeps guarded anatomy,
 * response range, wardrobe, rigging, persistence, preview, and export coherent.
 */
export class SkepticalReferenceProfile {
	static character() {
		return {
			measurements: this.measurements(),
			referenceMetrics: this.referenceMetrics(),
			bodyGeometry: SkepticalReferenceBodyGeometry.create(),
			bodyProfile: 'guardedSlim',
			expressionRangeProfile: 'guardedCompact',
			expressionProfile: 'guardedCompact',
			motion: 'groundedCompact',
			gesture: 'arms_crossed',
			acting: 'neutral',
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
				outerLineWidth: 0.0071,
				innerLineWidth: 0.0031,
				shadowWidth: 0.27
			}
		};
	}

	static referenceMetrics() {
		return {
			headRX: 34,
			headRY: 40,
			neckTopY: -198,
			neckBottomY: -184,
			shoulderY: -186,
			chestY: -138,
			waistY: -91,
			hipY: -79,
			kneeY: -42,
			ankleY: -3,
			footY: 5,
			shoulderHalf: 42,
			hipHalf: 27,
			armWidth: 12,
			legWidth: 13,
			shadowRX: 40
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
			line: '#2b2929', eye: '#242225', eyeLight: '#fffdf8',
			mouth: '#6c3032', tooth: '#fff9ee', blush: 'rgba(232,108,105,0.23)',
			shirt: '#8b493f', shirtDark: '#703a33', shirtLight: '#a15d52',
			jacket: '#8b493f', jacketDark: '#703a33', jacketLight: '#a15d52',
			pants: '#34353a', pantsDark: '#26272b', shoe: '#242326',
			skin: '#f3bf92', skinDark: '#d48960', skinLight: '#ffd5ae',
			hair: '#573a20', hairDark: '#382414', beard: '#573a20',
			beardDark: '#382414', hat: '#28282c'
		};
	}
}
