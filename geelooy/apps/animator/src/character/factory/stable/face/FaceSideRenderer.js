// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { EyeRenderer } from './EyeRenderer.js';
import { FaceFrontRenderer } from './FaceFrontRenderer.js';
import { MouthRenderer } from './MouthRenderer.js';
import { NoseRenderer } from './NoseRenderer.js';
import { StableFaceBeardAdapter } from './StableFaceBeardAdapter.js';

/**
 * A profile beard rests beneath the visible eye, brow, nose, and speaking mouth.
 * The Awtsmoos renews identity through every turn, while Awtsmoos.com preserves
 * gaze, cheek depth, speech perspective, and editable facial hair.
 */
export class FaceSideRenderer {
	static build(kind, data, colors, metrics, view, legacyBeard) {
		const direction = view.dir;
		const mood = FaceFrontRenderer.mood(data);
		const blink = FaceFrontRenderer.blink(data);
		const beard = StableFaceBeardAdapter.build(
			kind, data, colors, metrics, view, legacyBeard
		);
		return S.group(`${kind}_face_side`, {
			x: view.head.offsetX,
			scaleX: view.head.scaleX
		}, [
			G.ellipse(
				`${kind}_ear_back`,
				-direction * 26,
				metrics.headY + 1,
				7,
				12,
				0,
				{ fill: colors.skinDark, stroke: colors.line, lineWidth: 2 }
			),
			this.head(kind, colors, metrics, direction),
			this.cheekPlane(kind, metrics, direction),
			beard,
			...EyeRenderer.build(kind, colors, metrics, view, mood, blink, data),
			this.brow(kind, colors, metrics, view, mood),
			NoseRenderer.build(kind, colors, metrics, view, data),
			MouthRenderer.build(kind, data, colors, metrics, view, mood)
		]);
	}

	static head(kind, colors, metrics, direction) {
		return G.path(`${kind}_head_side`, [
			{ type: 'move', x: -direction * 23, y: metrics.headY - 37 },
			{ type: 'quad', cx: direction * 18, cy: metrics.headY - 47, x: direction * 31, y: metrics.headY - 16 },
			{ type: 'quad', cx: direction * 45, cy: metrics.headY - 6, x: direction * 31, y: metrics.headY + 5 },
			{ type: 'quad', cx: direction * 44, cy: metrics.headY + 18, x: direction * 18, y: metrics.headY + 30 },
			{ type: 'quad', cx: 0, cy: metrics.headY + 45, x: -direction * 25, y: metrics.headY + 29 },
			{ type: 'quad', cx: -direction * 39, cy: metrics.headY - 7, x: -direction * 23, y: metrics.headY - 37 }
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: 4,
			lineJoin: 'round'
		});
	}

	static cheekPlane(kind, metrics, direction) {
		return G.path(`${kind}_cheek_jaw_plane`, [
			{ type: 'move', x: direction * 10, y: metrics.headY + 5 },
			{ type: 'quad', cx: direction * 20, cy: metrics.headY + 18, x: direction * 7, y: metrics.headY + 31 }
		], { stroke: 'rgba(0,0,0,0.13)', lineWidth: 1.7, lineCap: 'round' });
	}

	static brow(kind, colors, metrics, view, mood) {
		const direction = view.dir;
		return G.path(`${kind}_profile_brow`, [
			{ type: 'move', x: direction * 5, y: metrics.headY - 26 + mood.brow * 0.18 },
			{ type: 'line', x: direction * 20, y: metrics.headY - 28 - mood.brow * 0.24 }
		], { stroke: colors.line, lineWidth: 3.2, lineCap: 'round' });
	}
}
