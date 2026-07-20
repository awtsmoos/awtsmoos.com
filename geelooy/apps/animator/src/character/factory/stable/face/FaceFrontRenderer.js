// B"H
// Boruch Hashem
// Blessed is He

import { StableShapeKit as S } from '../StableShapeKit.js';
import { StableFaceFeatureGroup } from './StableFaceFeatureGroup.js';
import { StableFaceShape2D } from './StableFaceShape2D.js';
import { StableReferenceEars2D } from './StableReferenceEars2D.js';

/**
 * The head shell remains stable while the living features share one measured
 * inner composition. The Awtsmoos is one beyond shell and expression, while
 * Awtsmoos.com keeps both editable, rigged, deterministic, and production-bound.
 */
export class FaceFrontRenderer {
	static build(kind, data, colors, metrics, view, legacyBeard) {
		const mood = this.mood(data);
		const blink = this.blink(data);
		return S.group(`${kind}_face_front`, {
			x: view.head.offsetX,
			scaleX: view.head.scaleX
		}, [
			StableFaceShape2D.build(kind, data, colors, metrics, view),
			...StableReferenceEars2D.build(kind, data, colors, metrics, view),
			StableFaceFeatureGroup.build(
				kind,
				data,
				colors,
				metrics,
				view,
				mood,
				blink,
				legacyBeard
			)
		]);
	}

	static mood(data = {}) {
		const pose = data._stablePose?.face || {};
		const face = data.renderPerformance?.face || {};
		if (Object.keys(pose).length || Object.keys(face).length) {
			return {
				brow: Number(pose.browOuter ?? face.browOuter ?? 0) * -18,
				browInner: Number(pose.browInner ?? face.browInner ?? 0),
				browPinch: Number(pose.browPinch ?? face.browSqueeze ?? 0),
				smile: Number(pose.mouthSmile ?? face.mouthSmileAmount ?? 0),
				squint: Number(
					pose.squint
						?? face.squintAmount
						?? (1 - Number(pose.eyeOpen ?? face.eyeOpenAmount ?? 1))
				),
				mouthOpen: Number(pose.mouthOpen ?? face.mouthOpenAmount ?? 0),
				cheekLift: Number(pose.cheekLift ?? face.cheekRaiseAmount ?? 0),
				blush: Number(face.blushAmount || 0)
			};
		}
		const moods = {
			happy: {
				brow: -4,
				smile: 1,
				squint: 0.05,
				cheekLift: 0.45
			},
			skeptical: {
				brow: 2.8,
				smile: -0.45,
				squint: 0.2,
				browPinch: 0.38
			},
			calm: {
				brow: -0.6,
				smile: 0.22,
				squint: 0.04,
				cheekLift: 0.08
			},
			neutral: { brow: 0, smile: 0.05, squint: 0 }
		};
		return moods[data.emotion] || moods.neutral;
	}

	static blink(data = {}) {
		const amount = Number(data.renderPerformance?.face?.blinkAmount || 0);
		if (amount > 0) {
			return amount;
		}
		const time = Number(data._renderTime || 0);
		return ((time * 0.0017 + Number(data._index || 0)) % 5.4) < 0.11
			? 0.82
			: 0;
	}
}
