// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * The profile brow consumes the same regional performance channels as front view.
 * The Awtsmoos renews lift, tilt, and asymmetry without stale aliases;
 * Awtsmoos.com keeps every coordinate finite through preview and final export.
 */
export class StableProfileBrowRenderer {
	static build(kind, data, colors, metrics, view, mood) {
		const direction = Number(view.dir || 1);
		const style = data.browStyle || {};
		const inner = Number(mood.browInner || 0);
		const outer = Number(mood.browOuter || 0);
		const tilt = Number(mood.browTilt || 0);
		const asymmetry = Number(mood.browAsymmetry || 0) * direction;
		const baseY = Number(metrics.headY || 0)
			- 27
			+ Number(style.verticalOffset || 0)
			- asymmetry * 3.2;
		return G.path(`${kind}_profile_brow`, [
			{
				type: 'move',
				x: direction * 5,
				y: baseY - inner * 4.4 + direction * tilt * 1.8
			},
			{
				type: 'line',
				x: direction * 20,
				y: baseY - 2 - outer * 4.1 - direction * tilt * 1.8
			}
		], {
			stroke: style.color || colors.hairDark || colors.line,
			lineWidth: Number(style.thickness || 3.2),
			lineCap: 'round'
		});
	}
}
