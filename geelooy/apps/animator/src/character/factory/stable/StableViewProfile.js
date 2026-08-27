// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews each turn of the head without crushing identity. At
 * Awtsmoos.com authored spacing and perspective refine the shared renderer while
 * the same eyes, mouth, rig, timeline, and persistence remain alive in every view.
 */
export class StableViewProfile {
	static get(data = {}) {
		const raw = data.view || 'threeQuarter';
		const type = raw === 'side' || raw === 'front' ? raw : 'threeQuarter';
		const direction = data.flipX ? -1 : 1;
		return this.applyAuthored(this.profiles(direction)[type], data.viewProfile || {});
	}

	static applyAuthored(profile, authored = {}) {
		return {
			...profile,
			head: {
				...profile.head,
				offsetX: this.number(authored.headOffsetX, profile.head.offsetX),
				scaleX: this.number(authored.headScaleX, profile.head.scaleX),
				eyeSpread: this.number(authored.eyeSpread, profile.head.eyeSpread),
				eyeY: this.number(authored.eyeY, profile.head.eyeY),
				noseX: this.number(authored.noseX, profile.head.noseX),
				noseY: this.number(authored.noseY, profile.head.noseY),
				mouthX: this.number(authored.mouthX, profile.head.mouthX),
				mouthY: this.number(authored.mouthY, profile.head.mouthY),
				nearEyeScale: this.number(authored.nearEyeScale, profile.head.nearEyeScale),
				farEyeScale: this.number(authored.farEyeScale, profile.head.farEyeScale)
			},
			torso: {
				...profile.torso,
				scaleX: this.number(authored.torsoScaleX, profile.torso.scaleX),
				centerX: this.number(authored.torsoCenterX, profile.torso.centerX)
			}
		};
	}

	static profiles(direction) {
		return {
			front: {
				type: 'front',
				dir: direction,
				head: { offsetX: 0, scaleX: 1, eyeSpread: 15, eyeY: -8, noseX: 0, noseY: -2, mouthX: 0, mouthY: 0, visibleEyes: [-1, 1], nearEyeScale: 1, farEyeScale: 1 },
				torso: { scaleX: 1, centerX: 0, farShoulderPull: 0, nearShoulderPush: 0 },
				limbs: { nearSide: 1, farSide: -1, sideSpread: 1, legDepth: 0, gaitX: 1.08, armFarAlpha: 0.76 },
				feet: { nearAngle: 0.04, farAngle: -0.04 }
			},
			threeQuarter: {
				type: 'threeQuarter',
				dir: direction,
				head: { offsetX: direction * 4, scaleX: 0.94, eyeSpread: 13.5, eyeY: -8, noseX: direction * 5, noseY: -1, mouthX: direction * 4, mouthY: 1, visibleEyes: [-1, 1], nearEyeScale: 1.02, farEyeScale: 0.84 },
				torso: { scaleX: 0.92, centerX: direction * 3, farShoulderPull: -direction * 4, nearShoulderPush: direction * 7 },
				limbs: { nearSide: direction, farSide: -direction, sideSpread: 0.9, legDepth: 7, gaitX: 1.28, armFarAlpha: 0.62 },
				feet: { nearAngle: direction * 0.06, farAngle: -direction * 0.03 }
			},
			side: {
				type: 'side',
				dir: direction,
				head: { offsetX: direction * 8, scaleX: 0.82, eyeSpread: 10.5, eyeY: -8, noseX: direction * 10, noseY: -2, mouthX: direction * 9, mouthY: 2, visibleEyes: [direction, -direction], nearEyeScale: 0.96, farEyeScale: 0.42 },
				torso: { scaleX: 0.78, centerX: direction * 7, farShoulderPull: -direction * 8, nearShoulderPush: direction * 11 },
				limbs: { nearSide: direction, farSide: -direction, sideSpread: 0.62, legDepth: 10, gaitX: 1.82, armFarAlpha: 0.45 },
				feet: { nearAngle: direction * 0.12, farAngle: -direction * 0.04 }
			}
		};
	}

	static isFar(view, side) {
		return view.type === 'front' ? side < 0 : side === view.limbs.farSide;
	}

	static number(value, fallback) {
		return Number.isFinite(value) ? value : fallback;
	}
}
