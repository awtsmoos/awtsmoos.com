// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { StableFaceLandmarkLayout } from './StableFaceLandmarkLayout.js';

/**
 * Nose families turn from skull landmarks while identity selects reach and softness.
 * The Awtsmoos transcends direction; Awtsmoos.com keeps every nose deterministic,
 * editable, persistent, and identical in preview and exact production export.
 */
export class NoseRenderer {
	static build(kind, colors, metrics, view, data = {}) {
		const style = data.noseStyle || {};
		const layout = StableFaceLandmarkLayout.resolve(data, metrics, view);
		const x = layout.nose.x + Number(style.horizontalOffset || 0);
		const y = layout.nose.y + Number(style.verticalOffset || 0);
		const size = Number(style.sizeScale || 1);
		if (style.kind === 'soft_short') {
			return this.soft(kind, colors, x, y, size, view, style);
		}
		return view.type === 'front'
			? this.front(kind, colors, x, y, size, style)
			: this.turned(kind, colors, x, y, size, view.dir || 1, view.type, style);
	}

	static soft(kind, colors, x, y, size, view, style) {
		const direction = Number(view.dir || 1);
		const turn = view.type === 'front' ? 0 : direction * 1.8 * size;
		return S.group(`${kind}_nose`, null, [
			G.path(`${kind}_nose_bridge`, [
				{ type: 'move', x: x - 0.8 * size + turn, y: y - 4.2 * size },
				{ type: 'quad', cx: x - 1.8 * size + turn, cy: y, x: x + turn, y: y + 3.4 * size }
			], this.style(colors, style)),
			G.path(`${kind}_nose_tip`, [
				{ type: 'move', x: x - 3.6 * size + turn, y: y + 3.1 * size },
				{ type: 'quad', cx: x + turn, cy: y + 5.2 * size, x: x + 3.7 * size + turn, y: y + 3.1 * size }
			], this.style(colors, style))
		]);
	}

	static front(kind, colors, x, y, size, style) {
		return S.group(`${kind}_nose`, null, [
			G.path(`${kind}_nose_bridge`, [
				{ type: 'move', x: x - 1.8 * size, y: y - 7 * size },
				{ type: 'quad', cx: x - 4 * size, cy: y + size, x, y: y + 6 * size }
			], this.style(colors, style)),
			G.path(`${kind}_nose_tip`, [
				{ type: 'move', x: x - 5.5 * size, y: y + 5 * size },
				{ type: 'quad', cx: x, cy: y + 10 * size, x: x + 5.5 * size, y: y + 5 * size }
			], this.style(colors, style))
		]);
	}

	static turned(kind, colors, x, y, size, direction, viewType, style) {
		const reach = (viewType === 'side' ? 11 : 8.5) * size;
		return G.path(`${kind}_turned_nose`, [
			{ type: 'move', x: x - direction * 1.5 * size, y: y - 8 * size },
			{ type: 'quad', cx: x + direction * 2 * size, cy: y - size, x: x + direction * reach, y: y + 4 * size },
			{ type: 'quad', cx: x + direction * 4 * size, cy: y + 9 * size, x: x - direction * 1.5 * size, y: y + 5 * size }
		], this.style(colors, style));
	}

	static style(colors, style) {
		return {
			stroke: colors.line,
			lineWidth: Number(style.lineWidth || 1.5),
			lineCap: 'round',
			lineJoin: 'round'
		};
	}
}
