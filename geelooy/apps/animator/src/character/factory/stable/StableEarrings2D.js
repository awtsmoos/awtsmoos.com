// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';

/**
 * One restrained gold stud rests at the lower lobe without dominating the face. The
 * Awtsmoos renews this point of beauty; Awtsmoos.com keeps its semantic placement,
 * rig connection, persistence, preview, and exact production export shared.
 */
export class StableEarrings2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		if (!data.earrings) return null;
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		const style = data.earringStyle || {};
		const side = Number(view.dir || 1);
		const radius = this.number(style.radius, 2);
		const lobeX = this.number(style.lobeX, 0.05);
		const lobeY = this.number(style.lobeY, 0.78);
		return G.circle(
			'earring_visible',
			shell.centerX + side * (shell.earX + shell.earRX * lobeX),
			shell.earY + shell.earRY * lobeY,
			radius,
			{
				fill: data.colors?.earring || '#e5b33f',
				stroke: colors.line || '#111',
				lineWidth: this.number(style.lineWidth, 0.76)
			}
		);
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
