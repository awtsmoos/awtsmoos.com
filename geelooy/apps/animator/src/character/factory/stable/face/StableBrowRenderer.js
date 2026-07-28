// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableFaceLandmarkLayout } from './StableFaceLandmarkLayout.js';

/**
 * Brows act from the same anatomy as the eyes instead of hovering independently.
 * The Awtsmoos animates finite feeling; Awtsmoos.com preserves asymmetric joy,
 * skepticism, calm, serialization, and renderer parity in each authored stroke.
 */
export class StableBrowRenderer {
	static build(kind, data = {}, colors = {}, metrics = {}, view = {}, mood = {}) {
		const style = data.browStyle || {};
		const layout = StableFaceLandmarkLayout.resolve(data, metrics, view);
		const thickness = Number(style.thickness || 3.2);
		const width = Number(style.width || 16);
		return (view.head.visibleEyes || [-1, 1]).map(side => {
			const anchor = StableFaceLandmarkLayout.eye(layout, side, view);
			const sideStyle = this.sideStyle(style, side);
			const pinch = Number(mood.browPinch || 0) * -side * 2.3;
			const inner = Number(mood.browInner || 0) * -5;
			const moodTilt = Number(mood.brow || 0) * (side === view.dir ? 0.28 : 0.2);
			const tilt = moodTilt + sideStyle.tilt;
			const baseY = layout.brows.y + sideStyle.vertical + inner;
			return G.path(`${kind}_authored_brow_${side}`, [
				{
					type: 'move',
					x: anchor.x - side * width * 0.5 + pinch,
					y: baseY + side * tilt
				},
				{
					type: 'quad',
					cx: anchor.x,
					cy: baseY - 4 - sideStyle.arch,
					x: anchor.x + side * width * 0.5,
					y: baseY - 2 - side * tilt
				}
			], {
				stroke: style.color || colors.hairDark || colors.line,
				lineWidth: side === view.dir ? thickness : thickness * 0.82,
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
