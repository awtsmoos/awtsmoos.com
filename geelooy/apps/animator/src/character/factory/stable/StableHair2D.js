// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHairline2D } from './StableHairline2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * The Awtsmoos renews hair as crown, natural hairline, and quiet temple locks, not
 * vertical bars across a living forehead. Awtsmoos.com keeps every contour bound
 * to view, motion, editable appearance data, save, reload, and export.
 */
export class StableHair2D {
	static back(data, colors, metrics, time, view) {
		if ((data.headwear?.type || data.hatType) === 'head_wrap') {
			return S.group('hair_back_under_wrap', null, []);
		}
		const sideStretch = view.type === 'side'
			? 0.8
			: view.type === 'threeQuarter'
				? 0.92
				: 1;
		return S.group('hair_back', null, [
			G.ellipse('hair_back_mass', Number(view.head?.offsetX || 0) * 0.5, metrics.headY - 3, (metrics.headRX + 3) * sideStretch, metrics.headRY + 3, 0, { fill: colors.hairDark, stroke: colors.line, lineWidth: 2.5 }),
			...this.templeLocks(colors, metrics, view)
		]);
	}

	static front(data, colors, metrics, time, view) {
		return S.group('hair_front_natural', null, [
			StableHairline2D.front(data, colors, metrics, time, view),
			...this.sideburns(data, colors, metrics, view)
		]);
	}

	static templeLocks(colors, metrics, view) {
		if (view.type === 'side') {
			return [G.path('hair_side_profile', [
				{ type: 'move', x: view.dir * metrics.headRX * 0.84, y: metrics.headY - 18 },
				{ type: 'quad', cx: view.dir * (metrics.headRX + 5), cy: metrics.headY + 5, x: view.dir * metrics.headRX * 0.62, y: metrics.headY + 18 }
			], { stroke: colors.hairDark, lineWidth: 6, lineCap: 'round' })];
		}
		return [];
	}

	static sideburns(data, colors, metrics, view) {
		if ((data.headwear?.type || data.hatType) === 'head_wrap') {
			return [];
		}
		return [-1, 1].map(side => G.path(`natural_sideburn_${side}`, [
			{ type: 'move', x: side * metrics.headRX * 0.82, y: metrics.headY - 14 },
			{ type: 'quad', cx: side * (metrics.headRX + 2), cy: metrics.headY - 1, x: side * metrics.headRX * 0.8, y: metrics.headY + 8 }
		], { stroke: colors.hairDark, lineWidth: 5, lineCap: 'round' }));
	}
}
