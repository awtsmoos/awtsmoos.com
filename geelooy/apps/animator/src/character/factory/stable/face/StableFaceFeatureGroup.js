// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableReferenceBeardLayer2D } from '../StableReferenceBeardLayer2D.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { EyeRenderer } from './EyeRenderer.js';
import { StableFaceLandmarkLayout } from './StableFaceLandmarkLayout.js';
import { MouthRenderer } from './MouthRenderer.js';
import { NoseRenderer } from './NoseRenderer.js';
import { StableBrowRenderer } from './StableBrowRenderer.js';

/**
 * All acting features now inhabit one skull without a compensating puppet offset.
 * The Awtsmoos joins revelation and concealment; Awtsmoos.com keeps beard,
 * eyes, cheeks, and speech editable in the authoritative production graph.
 */
export class StableFaceFeatureGroup {
	static build(kind, data, colors, metrics, view, mood, blink, legacyBeard) {
		const authoredBeard = StableReferenceBeardLayer2D.build(
			data,
			colors,
			metrics,
			view,
			mood
		);
		return S.group(`${kind}_facial_features`, null, [
			authoredBeard,
			legacyBeard && !authoredBeard
				? this.legacyBeard(kind, colors, metrics)
				: null,
			...EyeRenderer.build(kind, colors, metrics, view, mood, blink, data),
			...StableBrowRenderer.build(kind, data, colors, metrics, view, mood),
			NoseRenderer.build(kind, colors, metrics, view, data),
			this.cheeks(kind, data, colors, metrics, view, mood),
			MouthRenderer.build(kind, data, colors, metrics, view, mood)
		]);
	}

	static cheeks(kind, data, colors, metrics, view, mood = {}) {
		const layout = StableFaceLandmarkLayout.resolve(data, metrics, view);
		const style = data.faceStyle || {};
		const lift = Math.max(0.05, Number(mood.cheekLift || 0));
		const alpha = Math.min(0.35, 0.06 + lift * 0.24
			+ Number(mood.blush || 0) * 0.2);
		return S.group(`${kind}_cheeks`, null, [-1, 1].map(side => G.ellipse(
			`${kind}_cheek_${side}`,
			layout.shell.centerX + side * layout.cheeks.spread,
			layout.cheeks.y - lift * 2,
			Number(style.cheekRX || layout.shell.radiusX * 0.18) + lift * 2,
			Number(style.cheekRY || layout.shell.radiusY * 0.1) + lift,
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
			{ fill: colors.beard, stroke: colors.line, lineWidth: 2 }
		);
	}
}
