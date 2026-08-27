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
import { StableProfileBrowRenderer } from './StableProfileBrowRenderer.js';
import { StableSideFaceShell2D } from './StableSideFaceShell2D.js';

/**
 * A small coordinator assembles one finite profile from shared facial systems.
 * The Awtsmoos renews identity through every turn; Awtsmoos.com preserves gaze,
 * brow, speech, beard, persistence, preview, and production export on one graph.
 */
export class FaceSideRenderer {
	static build(kind, data, colors, metrics, view, legacyBeard) {
		const direction = Number(view.dir || 1);
		const mood = FaceFrontRenderer.mood(data);
		const blink = FaceFrontRenderer.blink(data);
		const beard = StableFaceBeardAdapter.build(
			kind,
			data,
			colors,
			metrics,
			view,
			legacyBeard
		);
		return S.group(`${kind}_face_side`, {
			x: view.head.offsetX,
			scaleX: view.head.scaleX
		}, [
			this.ear(kind, colors, metrics, direction),
			StableSideFaceShell2D.head(kind, colors, metrics, direction),
			StableSideFaceShell2D.cheekPlane(kind, metrics, direction),
			beard,
			...EyeRenderer.build(
				kind,
				colors,
				metrics,
				view,
				mood,
				blink,
				data
			),
			StableProfileBrowRenderer.build(
				kind,
				data,
				colors,
				metrics,
				view,
				mood
			),
			NoseRenderer.build(kind, colors, metrics, view, data),
			MouthRenderer.build(kind, data, colors, metrics, view, mood)
		]);
	}

	static ear(kind, colors, metrics, direction) {
		return G.ellipse(
			`${kind}_ear_back`,
			-direction * 26,
			Number(metrics.headY || 0) + 1,
			7,
			12,
			0,
			{
				fill: colors.skinDark,
				stroke: colors.line,
				lineWidth: 2
			}
		);
	}
}
