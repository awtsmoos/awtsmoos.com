// B"H
// Boruch Hashem
// Blessed is He

import { StableShapeKit as S } from '../StableShapeKit.js';
import { StableFaceFeatureGroup } from './StableFaceFeatureGroup.js';
import { StableFaceShape2D } from './StableFaceShape2D.js';
import { StableReferenceEars2D } from './StableReferenceEars2D.js';

/**
 * The renderer receives an evaluated pose and never invents a permanent mood.
 * The Awtsmoos renews every visible moment; Awtsmoos.com keeps neutral identity,
 * dynamic acting, blink, persistence, preview, and export on one shared path.
 */
export class FaceFrontRenderer {
	/** Builds the complete front-facing facial vessel. */
	static build(kind, data, colors, metrics, view, legacyBeard) {
		const mood = this.mood(data);
		return S.group(`${kind}_face_front`, {
			x: view.head.offsetX,
			scaleX: view.head.scaleX
		}, [
			StableFaceShape2D.build(kind, data, colors, metrics, view),
			...StableReferenceEars2D.build(kind, data, colors, metrics, view),
			StableFaceFeatureGroup.build(
				kind, data, colors, metrics, view, mood, this.blink(data), legacyBeard
			)
		]);
	}

	/** Resolves expression channels without changing identity landmarks. */
	static mood(data = {}) {
		const pose = data._stablePose?.face || {};
		const face = data.renderPerformance?.face || {};
		return {
			browOuter: Number(pose.browOuter ?? face.browOuter ?? 0),
			browInner: Number(pose.browInner ?? face.browInner ?? 0),
			browPinch: Number(pose.browPinch ?? face.browSqueeze ?? 0),
			browTilt: Number(pose.browTilt ?? face.browTilt ?? 0),
			browAsymmetry: Number(pose.browAsymmetry ?? face.browAsymmetry ?? 0),
			smile: Number(pose.mouthSmile ?? face.mouthSmileAmount ?? 0),
			squint: Number(pose.squint ?? face.squintAmount ?? 0),
			mouthOpen: Number(pose.mouthOpen ?? face.mouthOpenAmount ?? 0),
			mouthJaw: Number(pose.mouthJaw ?? face.mouthJawAmount ?? 0),
			mouthAsymmetry: Number(pose.mouthAsymmetry ?? face.mouthAsymmetry ?? 0),
			cheekLift: Number(pose.cheekLift ?? face.cheekRaiseAmount ?? 0),
			blush: Number(face.blushAmount || 0),
			upperLid: Number(pose.upperLid ?? face.upperLidAmount ?? 0),
			lowerLid: Number(pose.lowerLid ?? face.lowerLidAmount ?? 0),
			eyeAsymmetry: Number(pose.eyeAsymmetry ?? face.eyeAsymmetry ?? 0)
		};
	}

	/** Converts evaluated openness into one deterministic blink amount. */
	static blink(data = {}) {
		const pose = data._stablePose?.face || {};
		const face = data.renderPerformance?.face || {};
		const explicit = Number(pose.blink ?? face.blinkAmount ?? 0);
		const openness = Number(pose.eyeOpen ?? face.eyeOpenAmount ?? 1);
		return this.clamp(Math.max(explicit, 1 - openness), 0, 1);
	}

	/** Bounds renderer-facing face values. */
	static clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, Number(value || 0)));
	}
}
