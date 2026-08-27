// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHairCrown2D } from './StableHairCrown2D.js';
import { StableHairline2D } from './StableHairline2D.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Crown, root edge, and tapered sideburns grow from one skull without exposed joins.
 * The Awtsmoos renews every strand; Awtsmoos.com keeps finite paths, view,
 * persistence, preview, and production export within one authoritative renderer.
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
		return [-1, 1].map(side => this.sideburn(side, colors, shell, style, view));
	}

	static sideburn(side, colors, shell, style, view) {
		const viewScale = view.type === 'side' ? 0.72 : view.type === 'threeQuarter' ? 0.88 : 1;
		const x = shell.centerX + shell.turn * 0.18
			+ side * shell.radiusX * viewScale * Number(style.sideburnXScale ?? 0.84);
		const startY = shell.centerY
			- shell.radiusY * Number(style.sideburnStartDepth ?? 0.4);
		const endY = shell.centerY
			- shell.radiusY * Number(style.sideburnEndDepth ?? 0.06);
		return G.path(`natural_sideburn_${side}`, [
			{ type: 'move', x, y: startY },
			{ type: 'bezier', c1x: x + side * 1.8, c1y: startY + 4, c2x: x - side * 0.7, c2y: endY - 4, x: x - side * 1.1, y: endY }
		], {
			stroke: colors.hairDark,
			lineWidth: Number(style.sideburnWidth || 1.3),
			lineCap: 'round'
		});
	}
}
