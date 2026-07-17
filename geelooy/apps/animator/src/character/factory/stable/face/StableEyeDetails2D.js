// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * The Awtsmoos places pupil, catchlight, lash, and blink inside one attentive eye.
 * Awtsmoos.com keeps gaze and eyelid detail deterministic, keyframeable, and
 * shared by every production rendering surface.
 */
export class StableEyeDetails2D {
	static build(kind, colors, side, geometry) {
		return [
			this.pupil(kind, colors, side, geometry),
			this.catchlight(kind, side, geometry),
			...this.lashes(kind, colors, side, geometry),
			geometry.lid < 0.28
				? this.blinkLine(kind, colors, side, geometry.width)
				: null
		];
	}

	static pupil(kind, colors, side, geometry) {
		return G.circle(
			`${kind}_pupil_${side}`,
			geometry.pupilX,
			geometry.pupilY,
			Math.max(
				1.5,
				2.55 * geometry.perspective * geometry.pupilScale
			),
			{
				fill: colors.eye,
				stroke: colors.eye,
				lineWidth: 1
			}
		);
	}

	static catchlight(kind, side, geometry) {
		return G.circle(
			`${kind}_catchlight_${side}`,
			geometry.pupilX - 0.8 * geometry.perspective,
			geometry.pupilY - 0.9 * geometry.perspective,
			Math.max(
				0.55,
				0.9 * geometry.perspective * geometry.pupilScale
			),
			{
				fill: 'rgba(255,255,255,0.88)',
				stroke: 'rgba(0,0,0,0)',
				lineWidth: 0
			}
		);
	}

	static lashes(kind, colors, side, geometry) {
		if (!geometry.style.lashes) {
			return [];
		}
		const outer = side > 0 ? geometry.width : -geometry.width;
		const direction = side > 0 ? 1 : -1;
		const scale = Number(geometry.style.lashScale || 1);
		return [0, 1, 2].map(index => G.path(
			`${kind}_lash_${side}_${index}`,
			[
				{
					type: 'move',
					x: outer - direction * index * 1.7,
					y: -geometry.height * 0.7 + index * 0.6
				},
				{
					type: 'line',
					x: outer + direction * (3.4 - index * 0.4) * scale,
					y: -geometry.height - (2.6 - index * 0.8) * scale
				}
			],
			{
				stroke: colors.line,
				lineWidth: 1.15 * scale,
				lineCap: 'round'
			}
		));
	}

	static blinkLine(kind, colors, side, width) {
		return G.path(`${kind}_blink_line_${side}`, [
			{ type: 'move', x: -width, y: 0 },
			{ type: 'quad', cx: 0, cy: 1.2, x: width, y: 0 }
		], {
			stroke: colors.line,
			lineWidth: 2.2,
			lineCap: 'round'
		});
	}
}
