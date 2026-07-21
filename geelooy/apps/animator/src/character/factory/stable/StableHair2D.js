// B"H
// Boruch Hashem
// Blessed is He

import { StableHairCrown2D } from './StableHairCrown2D.js';
import { StableHairline2D } from './StableHairline2D.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Hair layers follow one authored skull without exposing mechanical joins. The
 * Awtsmoos renews crown, sideburn, fringe, and bun, while Awtsmoos.com keeps
 * every contour editable in the authoritative production renderer.
 */
export class StableHair2D {
	static back(data, colors, metrics, time, view) {
		return StableHairCrown2D.back(data, colors, metrics, view);
	}

	static front(data, colors, metrics, time, view) {
		if ((data.headwear?.type || data.hatType) === 'head_wrap') {
			return null;
		}

		return S.group('hair_front_natural', null, [
			StableHairline2D.front(data, colors, metrics, time, view),
			...this.sideburns(data, colors, metrics, view)
		]);
	}

	static overlay(data, colors, metrics, time, view) {
		return StableHairline2D.overlay(data, colors, metrics, time, view);
	}

	static sideburns(data, colors, metrics, view) {
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		const style = data.hairStyle || {};
		return [-1, 1].map(side => this.sideburn(side, colors, shell, style));
	}

	static sideburn(side, colors, shell, style) {
		const x = shell.centerX
			+ side * shell.radiusX * Number(style.sideburnXScale ?? 0.9);
		const startY = shell.centerY
			- shell.radiusY * Number(style.sideburnStartDepth ?? 0.3);
		const endY = shell.centerY
			+ shell.radiusY * Number(style.sideburnEndDepth ?? 0.16);
		return {
			type: 'path',
			id: `natural_sideburn_${side}`,
			commands: [
				{ type: 'move', x, y: startY },
				{ type: 'bezier', c1x: x + side * 2.1, c1y: startY + (endY - startY) * 0.35, c2x: x - side * 1.2, c2y: startY + (endY - startY) * 0.75, x: x - side * 0.7, y: endY }
			],
			style: {
				stroke: colors.hairDark,
				lineWidth: Number(style.sideburnWidth || 2.3),
				lineCap: 'round'
			}
		};
	}
}
