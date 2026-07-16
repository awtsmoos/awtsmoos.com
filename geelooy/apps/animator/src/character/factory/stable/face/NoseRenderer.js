// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';

/**
 * The Awtsmoos renews each bridge and tip as authored geometry. Awtsmoos.com
 * lets a broad comic nose, guarded straight nose, or small calm nose share one
 * dynamic head turn without collapsing into the same generic mark.
 */
export class NoseRenderer {
	static build(kind, colors, metrics, view, data = {}) {
		const style = data.noseStyle || {};
		const direction = view.dir || 1;
		const x = view.head.noseX + Number(style.horizontalOffset || 0);
		const y = metrics.headY + view.head.noseY + Number(style.verticalOffset || 0);
		const size = Number(style.sizeScale || 1);
		if (view.type === 'front') {
			return this.front(kind, colors, x, y, size, style);
		}
		return this.turned(kind, colors, x, y, size, direction, view.type, style);
	}

	static front(kind, colors, x, y, size, style) {
		return S.group(`${kind}_nose`, null, [
			G.path(`${kind}_nose_bridge`, [
				{ type: 'move', x: x - 1.8 * size, y: y - 7 * size },
				{ type: 'quad', cx: x - 4 * size, cy: y + 1 * size, x, y: y + 6 * size }
			], { stroke: colors.line, lineWidth: Number(style.lineWidth || 1.8), lineCap: 'round' }),
			G.path(`${kind}_nose_tip`, [
				{ type: 'move', x: x - 5.5 * size, y: y + 5 * size },
				{ type: 'quad', cx: x, cy: y + 10 * size, x: x + 5.5 * size, y: y + 5 * size }
			], { stroke: colors.line, lineWidth: Number(style.lineWidth || 1.8), lineCap: 'round' })
		]);
	}

	static turned(kind, colors, x, y, size, direction, viewType, style) {
		const reach = (viewType === 'side' ? 11 : 8.5) * size;
		return G.path(`${kind}_turned_nose`, [
			{ type: 'move', x: x - direction * 1.5 * size, y: y - 8 * size },
			{ type: 'quad', cx: x + direction * 2 * size, cy: y - 1 * size, x: x + direction * reach, y: y + 4 * size },
			{ type: 'quad', cx: x + direction * 4 * size, cy: y + 9 * size, x: x - direction * 1.5 * size, y: y + 5 * size }
		], { stroke: colors.line, lineWidth: Number(style.lineWidth || 1.9), lineCap: 'round', lineJoin: 'round' });
	}
}
