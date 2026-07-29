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
	static build(kind, data, colors, metrics, view, legacyBeard) {
		const mood = this.mood(data);
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
				this.blink(data),
				legacyBeard
			)
		]);
	}

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
			upperLid: Number(face.upperLidAmount || 0),
			lowerLid: Number(face.lowerLidAmount || 0),
			eyeAsymmetry: Number(face.eyeAsymmetry || 0)
		};
	}

	static blink(data = {}) {
		const amount = Number(data.renderPerformance?.face?.blinkAmount || 0);
		if (amount > 0) {
			return amount;
		}
		const time = Number(data._renderTime || 0);
		const phase = (
			time * 0.0017
			+ 0.72
			+ Number(data._index || 0) * 1.61
		) % 5.4;
		return phase < 0.11 ? 0.82 : 0;
	}
}
