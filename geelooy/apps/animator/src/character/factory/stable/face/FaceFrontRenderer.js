// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { EyeRenderer } from './EyeRenderer.js';
import { MouthRenderer } from './MouthRenderer.js';
import { NoseRenderer } from './NoseRenderer.js';
import { StableBrowRenderer } from './StableBrowRenderer.js';
import { StableFaceShape2D } from './StableFaceShape2D.js';

/**
 * The Awtsmoos renews a frontal face as a living arrangement of measured cheeks,
 * eyes, brows, nose, and mouth. Awtsmoos.com preserves expression and likeness
 * through the same rig and performance state instead of a fixed illustration.
 */
export class FaceFrontRenderer {
	static build(kind, data, colors, metrics, view, beard) {
		const mood = this.mood(data);
		const blink = this.blink(data);
		return S.group(`${kind}_face_front`, {
			x: view.head.offsetX,
			scaleX: view.head.scaleX
		}, [
			StableFaceShape2D.build(kind, data, colors, metrics, view),
			...this.ears(kind, data, colors, metrics),
			...EyeRenderer.build(kind, colors, metrics, view, mood, blink, data),
			...StableBrowRenderer.build(kind, data, colors, metrics, view, mood),
			NoseRenderer.build(kind, colors, metrics, view, data),
			this.cheeks(kind, data, colors, metrics, mood),
			MouthRenderer.build(kind, data, colors, metrics, view, mood),
			beard ? this.beard(kind, colors, metrics) : null
		]);
	}

	static ears(kind, data, colors, metrics) {
		const scale = Number(data.faceStyle?.earScale || 1);
		return [-1, 1].map(side => G.ellipse(
			`${kind}_ear_${side}`,
			side * metrics.headRX,
			metrics.headY,
			7 * scale,
			12 * scale,
			0,
			{ fill: colors.skinDark, stroke: colors.line, lineWidth: 2.2 }
		));
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
				squint: Number(pose.squint ?? face.squintAmount ?? (1 - Number(pose.eyeOpen ?? face.eyeOpenAmount ?? 1))),
				mouthOpen: Number(pose.mouthOpen ?? face.mouthOpenAmount ?? 0),
				cheekLift: Number(pose.cheekLift ?? face.cheekRaiseAmount ?? 0),
				blush: Number(face.blushAmount || 0)
			};
		}
		const map = {
			happy: { brow: -4, smile: 1, squint: 0.05, cheekLift: 0.45 },
			skeptical: { brow: 2.8, smile: -0.45, squint: 0.2, browPinch: 0.38 },
			calm: { brow: -0.6, smile: 0.22, squint: 0.04, cheekLift: 0.08 },
			excited: { brow: -7, smile: 0.85, squint: 0 },
			focused: { brow: 3, smile: 0, squint: 0.15 },
			surprised: { brow: -8, smile: 0.2, squint: -0.08 },
			neutral: { brow: 0, smile: 0.05, squint: 0 }
		};
		return map[data.emotion] || map.neutral;
	}

	static blink(data = {}) {
		const face = data.renderPerformance?.face || {};
		if (Number(face.blinkAmount || 0) > 0) {
			return Number(face.blinkAmount);
		}
		const time = Number(data._renderTime || 0);
		return ((time * 0.0017 + Number(data._index || 0)) % 5.4) < 0.11 ? 0.82 : 0;
	}

	static cheeks(kind, data, colors, metrics, mood = {}) {
		const lift = Math.max(0.05, Number(mood.cheekLift || 0));
		const style = data.faceStyle || {};
		const alpha = Math.min(0.42, 0.08 + lift * 0.32 + Number(mood.blush || 0) * 0.25);
		return S.group(`${kind}_cheeks`, null, [-1, 1].map(side => G.ellipse(
			`${kind}_cheek_${side}`,
			side * Number(style.cheekX || 19),
			metrics.headY + Number(style.cheekY || 11) - lift * 2,
			Number(style.cheekRX || 6) + lift * 2,
			Number(style.cheekRY || 4) + lift,
			0,
			{ fill: colors.blush || `rgba(255,120,120,${alpha})`, stroke: 'rgba(0,0,0,0)', lineWidth: 0 }
		)));
	}

	static beard(kind, colors, metrics) {
		return G.path(`${kind}_beard`, [
			{ type: 'move', x: -27, y: metrics.headY + 23 },
			{ type: 'quad', cx: -18, cy: metrics.headY + 72, x: 0, y: metrics.beardBottomY },
			{ type: 'quad', cx: 18, cy: metrics.headY + 72, x: 27, y: metrics.headY + 23 },
			{ type: 'quad', cx: 0, cy: metrics.headY + 42, x: -27, y: metrics.headY + 23 }
		], { fill: colors.beard, stroke: colors.line, lineWidth: 3.2, lineJoin: 'round' });
	}
}
