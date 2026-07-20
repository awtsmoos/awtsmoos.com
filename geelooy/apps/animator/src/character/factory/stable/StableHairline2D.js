// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Natural hair remains visible beneath cap and wrap. The Awtsmoos joins every
 * finite lock while Awtsmoos.com keeps these vectors editable and production-bound.
 */
export class StableHairline2D {
	static front(data, colors, metrics, time, view) {
		if ((data.headwear?.type || data.hatType) === 'head_wrap') {
			return null;
		}
		return this.maleHairline(colors, StableHeadShellGeometry.resolve(data, metrics, view));
	}

	static overlay(data, colors, metrics, time, view) {
		if ((data.headwear?.type || data.hatType) !== 'head_wrap') {
			return null;
		}
		return this.feminineFringe(colors, StableHeadShellGeometry.resolve(data, metrics, view), data.hairStyle || {});
	}

	static maleHairline(colors, shell) {
		const x = shell.centerX;
		const topY = shell.centerY - shell.radiusY * 0.59;
		const fringeY = shell.centerY - shell.radiusY * 0.27;
		const width = shell.radiusX * 0.84;
		return G.path('natural_male_hairline', [
			{ type: 'move', x: x - width, y: topY },
			{ type: 'quad', cx: x, cy: shell.centerY - shell.radiusY * 0.98, x: x + width, y: topY },
			{ type: 'line', x: x + width * 0.9, y: fringeY },
			{ type: 'quad', cx: x + width * 0.66, cy: fringeY - 7, x: x + width * 0.46, y: fringeY - 2 },
			{ type: 'line', x: x + width * 0.32, y: fringeY + 4 },
			{ type: 'line', x: x + width * 0.18, y: fringeY - 2 },
			{ type: 'line', x, y: fringeY + 3 },
			{ type: 'line', x: x - width * 0.2, y: fringeY - 2 },
			{ type: 'quad', cx: x - width * 0.56, cy: fringeY - 8, x: x - width * 0.9, y: fringeY + 1 },
			{ type: 'line', x: x - width, y: topY }
		], { fill: colors.hair, stroke: colors.hairDark, lineWidth: 2, lineJoin: 'round' });
	}

	static feminineFringe(colors, shell, style) {
		const x = shell.centerX;
		const partX = x - shell.radiusX * Number(style.partX || 0.28);
		const crownY = shell.centerY - shell.radiusY * 0.76;
		const left = x - shell.radiusX * 0.86;
		const right = x + shell.radiusX * 0.27;
		return S.group('feminine_side_part_fringe', null, [
			G.path('feminine_fringe_mass', [
				{ type: 'move', x: left, y: shell.centerY - shell.radiusY * 0.16 },
				{ type: 'quad', cx: left - 2, cy: crownY + 8, x: partX, y: crownY },
				{ type: 'quad', cx: x - shell.radiusX * 0.02, cy: crownY - 2, x: right, y: crownY + 10 },
				{ type: 'quad', cx: right, cy: shell.centerY - shell.radiusY * 0.12, x: x - shell.radiusX * 0.12, y: shell.centerY - shell.radiusY * 0.08 },
				{ type: 'quad', cx: x - shell.radiusX * 0.58, cy: shell.centerY - shell.radiusY * 0.02, x: left, y: shell.centerY - shell.radiusY * 0.16 }
			], { fill: colors.hair || '#3b2116', stroke: colors.hairDark || '#211109', lineWidth: 2, lineJoin: 'round' }),
			G.path('feminine_fringe_part', [
				{ type: 'move', x: partX, y: crownY + 1 },
				{ type: 'quad', cx: x - 4, cy: crownY + 5, x: right - 3, y: crownY + 11 }
			], { stroke: 'rgba(255,255,255,0.14)', lineWidth: 1.2, lineCap: 'round' })
		]);
	}
}
