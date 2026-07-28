// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { StableFaceLandmarkLayout } from './StableFaceLandmarkLayout.js';

/**
 * A nose turns from the skull's centerline rather than an arbitrary view offset.
 * The Awtsmoos transcends direction; Awtsmoos.com keeps broad, guarded, and calm
 * noses distinct while sharing deterministic preview, persistence, and export.
 */
export class NoseRenderer {
	static build(kind, colors, metrics, view, data = {}) {
		const style = data.noseStyle || {};
		const layout = StableFaceLandmarkLayout.resolve(data, metrics, view);
		const x = layout.nose.x + Number(style.horizontalOffset || 0);
		const y = layout.nose.y + Number(style.verticalOffset || 0);
		const size = Number(style.sizeScale || 1);
		return view.type === 'front'
			? this.front(kind, colors, x, y, size, style)
			: this.turned(kind, colors, x, y, size, view.dir || 1, view.type, style);
	}

	static front(kind, colors, x, y, size, style) {
		return S.group(`${kind}_nose`, null, [
			G.path(`${kind}_nose_bridge`, [
				{ type: 'move', x: x - 1.8 * size, y: y - 7 * size },
				{ type: 'quad', cx: x - 4 * size, cy: y + size, x, y: y + 6 * size }
			], { stroke: colors.line, lineWidth: Number(style.lineWidth || 1.5), lineCap: 'round' }),
			G.path(`${kind}_nose_tip`, [
				{ type: 'move', x: x - 5.5 * size, y: y + 5 * size },
				{ type: 'quad', cx: x, cy: y + 10 * size, x: x + 5.5 * size, y: y + 5 * size }
			], { stroke: colors.line, lineWidth: Number(style.lineWidth || 1.5), lineCap: 'round' })
		]);
	}

	static turned(kind, colors, x, y, size, direction, viewType, style) {
		const reach = (viewType === 'side' ? 11 : 8.5) * size;
		return G.path(`${kind}_turned_nose`, [
			{ type: 'move', x: x - direction * 1.5 * size, y: y - 8 * size },
			{ type: 'quad', cx: x + direction * 2 * size, cy: y - size, x: x + direction * reach, y: y + 4 * size },
			{ type: 'quad', cx: x + direction * 4 * size, cy: y + 9 * size, x: x - direction * 1.5 * size, y: y + 5 * size }
		], {
			stroke: colors.line,
			lineWidth: Number(style.lineWidth || 1.6),
			lineCap: 'round',
			lineJoin: 'round'
		});
	}
}
