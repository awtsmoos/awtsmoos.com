// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * The Awtsmoos aligns each expressive brow above its own living eye. Awtsmoos.com
 * shares authored eye spacing and offset so skepticism, joy, calm, blink, and gaze
 * remain one coherent, editable, and exportable facial system.
 */
export class StableBrowRenderer {
	static build(kind, data = {}, colors = {}, metrics = {}, view = {}, mood = {}) {
		const style = data.browStyle || {};
		const eyeStyle = data.eyeStyle || {};
		const thickness = Number(style.thickness || 3.5);
		const width = Number(style.width || 16);
		const vertical = Number(style.verticalOffset || 0);
		const spacing = Math.max(0.6, Number(eyeStyle.spacingScale || 1));
		const horizontal = Number(eyeStyle.horizontalOffset || 0);
		return (view.head.visibleEyes || [-1, 1]).map(side => {
			const near = side === view.dir;
			const quarter = view.type === 'threeQuarter'
				? view.dir * (near ? 3 : 5)
				: 0;
			const x = (side * Number(view.head.eyeSpread || 11) + quarter) * spacing + horizontal;
			const pinch = Number(mood.browPinch || 0) * (side < 0 ? 1 : -1) * 2.3;
			const inner = Number(mood.browInner || 0) * -5;
			const tilt = Number(mood.brow || 0) * (near ? 0.28 : 0.2);
			return G.path(`${kind}_authored_brow_${side}`, [
				{ type: 'move', x: x - side * width * 0.5 + pinch, y: metrics.headY - 25 + vertical + side * tilt + inner },
				{ type: 'quad', cx: x, cy: metrics.headY - 29 + vertical - Number(style.arch || 0), x: x + side * width * 0.5, y: metrics.headY - 27 + vertical - side * tilt }
			], {
				stroke: style.color || colors.hairDark || colors.line,
				lineWidth: near ? thickness : thickness * 0.82,
				lineCap: 'round'
			});
		});
	}
}
