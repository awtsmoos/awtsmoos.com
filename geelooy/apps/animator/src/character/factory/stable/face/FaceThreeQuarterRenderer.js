// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { EyeRenderer } from './EyeRenderer.js';
import { FaceFrontRenderer } from './FaceFrontRenderer.js';
import { MouthRenderer } from './MouthRenderer.js';
import { NoseRenderer } from './NoseRenderer.js';
import { StableBrowRenderer } from './StableBrowRenderer.js';
import { StableFaceBeardAdapter } from './StableFaceBeardAdapter.js';
import { StableFaceShape2D } from './StableFaceShape2D.js';

/**
 * A turned beard supports visible eyes, brows, nose, cheeks, and living speech.
 * The Awtsmoos renews identity through perspective, while Awtsmoos.com preserves
 * far-eye compression and every editable production control in one graph.
 */
export class FaceThreeQuarterRenderer {
	static build(kind, data, colors, metrics, view, legacyBeard) {
		const mood = FaceFrontRenderer.mood(data);
		const blink = FaceFrontRenderer.blink(data);
		const direction = view.dir || 1;
		const beard = StableFaceBeardAdapter.build(
			kind, data, colors, metrics, view, legacyBeard
		);
		return S.group(`${kind}_face_three_quarter`, {
			x: view.head.offsetX,
			scaleX: view.head.scaleX
		}, [
			this.farEar(kind, data, colors, metrics, direction),
			StableFaceShape2D.build(kind, data, colors, metrics, view),
			this.cheekPlane(kind, data, direction, metrics),
			this.nearEar(kind, data, colors, metrics, direction),
			beard,
			...EyeRenderer.build(kind, colors, metrics, view, mood, blink, data),
			...StableBrowRenderer.build(kind, data, colors, metrics, view, mood),
			NoseRenderer.build(kind, colors, metrics, view, data),
			this.cheeks(kind, data, colors, metrics, direction, mood),
			MouthRenderer.build(kind, data, colors, metrics, view, mood)
		]);
	}

	static farEar(kind, data, colors, metrics, direction) {
		const scale = Number(data.faceStyle?.earScale || 1);
		return G.ellipse(
			`${kind}_far_ear`,
			-direction * metrics.headRX * 0.92,
			metrics.headY + 1,
			5.8 * scale,
			10.5 * scale,
			0,
			{ fill: colors.skinDark, stroke: colors.line, lineWidth: 1.8 }
		);
	}

	static nearEar(kind, data, colors, metrics, direction) {
		const scale = Number(data.faceStyle?.earScale || 1);
		return G.ellipse(
			`${kind}_near_ear`,
			direction * metrics.headRX * 0.98,
			metrics.headY + 1,
			7.2 * scale,
			12 * scale,
			0,
			{ fill: colors.skinDark, stroke: colors.line, lineWidth: 2.1 }
		);
	}

	static cheekPlane(kind, data, direction, metrics) {
		const style = data.faceStyle || {};
		return G.ellipse(
			`${kind}_near_cheek_plane`,
			direction * Number(style.cheekPlaneX || 13),
			metrics.headY + Number(style.cheekPlaneY || 9),
			Number(style.cheekPlaneRX || 14),
			Number(style.cheekPlaneRY || 20),
			direction * -9,
			{ fill: 'rgba(255,255,255,0.075)', stroke: 'rgba(0,0,0,0)', lineWidth: 0 }
		);
	}

	static cheeks(kind, data, colors, metrics, direction, mood = {}) {
		const style = data.faceStyle || {};
		const lift = Math.max(0.05, Number(mood.cheekLift || 0));
		return S.group(`${kind}_cheeks`, null, [
			G.ellipse(`${kind}_cheek_near`, direction * Number(style.cheekX || 18), metrics.headY + Number(style.cheekY || 10) - lift, Number(style.cheekRX || 6.4), Number(style.cheekRY || 4.2), 0, { fill: colors.blush, stroke: 'rgba(0,0,0,0)', lineWidth: 0 }),
			G.ellipse(`${kind}_cheek_far`, -direction * 13, metrics.headY + 11, 3.6, 2.8, 0, { fill: colors.blush, stroke: 'rgba(0,0,0,0)', lineWidth: 0 })
		]);
	}
}
