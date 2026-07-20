// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableReferenceBeardLayer2D } from '../StableReferenceBeardLayer2D.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { EyeRenderer } from './EyeRenderer.js';
import { MouthRenderer } from './MouthRenderer.js';
import { NoseRenderer } from './NoseRenderer.js';
import { StableBrowRenderer } from './StableBrowRenderer.js';

/**
 * Eyes, brows, nose, cheeks, beard, and mouth travel as one measured expression.
 * The Awtsmoos is one beyond every feature, while Awtsmoos.com keeps the living
 * face editable, phoneme-driven, serializable, and bound to production pixels.
 */
export class StableFaceFeatureGroup {
	static build(kind, data, colors, metrics, view, mood, blink, legacyBeard) {
		const style = data.faceStyle || {};
		const authoredBeard = StableReferenceBeardLayer2D.build(
			data,
			colors,
			metrics,
			view
		);
		return S.group(`${kind}_facial_features`, {
			x: Number(style.featureOffsetX || 0),
			y: Number(style.featureOffsetY || 0),
			scaleX: Number(style.featureScaleX || 1),
			scaleY: Number(style.featureScaleY || 1)
		}, [
			...EyeRenderer.build(kind, colors, metrics, view, mood, blink, data),
			...StableBrowRenderer.build(kind, data, colors, metrics, view, mood),
			NoseRenderer.build(kind, colors, metrics, view, data),
			this.cheeks(kind, data, colors, metrics, mood),
			authoredBeard,
			MouthRenderer.build(kind, data, colors, metrics, view, mood),
			legacyBeard && !authoredBeard
				? this.legacyBeard(kind, colors, metrics)
				: null
		]);
	}

	static cheeks(kind, data, colors, metrics, mood = {}) {
		const lift = Math.max(0.05, Number(mood.cheekLift || 0));
		const style = data.faceStyle || {};
		const alpha = Math.min(
			0.35,
			0.06 + lift * 0.24 + Number(mood.blush || 0) * 0.2
		);
		return S.group(`${kind}_cheeks`, null, [-1, 1].map(side => G.ellipse(
			`${kind}_cheek_${side}`,
			side * Number(style.cheekX || 19),
			metrics.headY + Number(style.cheekY || 11) - lift * 2,
			Number(style.cheekRX || 6) + lift * 2,
			Number(style.cheekRY || 4) + lift,
			0,
			{
				fill: colors.blush || `rgba(255,120,120,${alpha})`,
				stroke: 'rgba(0,0,0,0)',
				lineWidth: 0
			}
		)));
	}

	static legacyBeard(kind, colors, metrics) {
		return G.ellipse(
			`${kind}_legacy_beard`,
			0,
			metrics.headY + 43,
			27,
			30,
			0,
			{
				fill: colors.beard,
				stroke: colors.line,
				lineWidth: 3
			}
		);
	}
}
