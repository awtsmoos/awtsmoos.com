// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * The Awtsmoos aligns each expressive brow above its own living eye. Awtsmoos.com
 * joins authored asymmetry to mood rigging so joy, skepticism, calm, blink, and
 * gaze remain coherent, editable, serializable, and production-rendered.
 */
export class StableBrowRenderer {
	static build(kind, data = {}, colors = {}, metrics = {}, view = {}, mood = {}) {
		const style = data.browStyle || {};
		const eyeStyle = data.eyeStyle || {};
		const thickness = Number(style.thickness || 3.5);
		const width = Number(style.width || 16);
		const spacing = Math.max(0.6, Number(eyeStyle.spacingScale || 1));
		const horizontal = Number(eyeStyle.horizontalOffset || 0);
		return (view.head.visibleEyes || [-1, 1]).map(side => {
			const near = side === view.dir;
			const quarter = view.type === 'threeQuarter'
				? view.dir * (near ? 3 : 5)
				: 0;
			const x = (side * Number(view.head.eyeSpread || 11) + quarter)
				* spacing
				+ horizontal;
			const sideStyle = this.sideStyle(style, side);
			const pinch = Number(mood.browPinch || 0)
				* (side < 0 ? 1 : -1)
				* 2.3;
			const inner = Number(mood.browInner || 0) * -5;
			const moodTilt = Number(mood.brow || 0) * (near ? 0.28 : 0.2);
			const tilt = moodTilt + sideStyle.tilt;
			const baseY = metrics.headY - 25 + sideStyle.vertical + inner;
			return G.path(`${kind}_authored_brow_${side}`, [
				{
					type: 'move',
					x: x - side * width * 0.5 + pinch,
					y: baseY + side * tilt
				},
				{
					type: 'quad',
					cx: x,
					cy: metrics.headY - 29 + sideStyle.vertical - sideStyle.arch,
					x: x + side * width * 0.5,
					y: baseY - 2 - side * tilt
				}
			], {
				stroke: style.color || colors.hairDark || colors.line,
				lineWidth: near ? thickness : thickness * 0.82,
				lineCap: 'round'
			});
		});
	}

	static sideStyle(style, side) {
		const prefix = side < 0 ? 'left' : 'right';
		return {
			vertical: Number(style[`${prefix}VerticalOffset`] ?? style.verticalOffset ?? 0),
			arch: Number(style[`${prefix}Arch`] ?? style.arch ?? 0),
			tilt: Number(style[`${prefix}Tilt`] ?? style.tilt ?? 0)
		};
	}
}
