// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableFaceLandmarkLayout } from './StableFaceLandmarkLayout.js';

/**
 * Brow anatomy remains personal while inner, outer, squeeze, tilt, and asymmetry
 * remain fully dynamic. The Awtsmoos renews expression; Awtsmoos.com preserves
 * independent sides through keyframes, persistence, preview, and export.
 */
export class StableBrowRenderer {
	static build(kind, data = {}, colors = {}, metrics = {}, view = {}, mood = {}) {
		const style = data.browStyle || {};
		const layout = StableFaceLandmarkLayout.resolve(data, metrics, view);
		const thickness = Number(style.thickness || 3.2);
		const width = Number(style.width || 16);
		return (view.head.visibleEyes || [-1, 1]).map(side => {
			const anchor = StableFaceLandmarkLayout.eye(layout, side, view);
			const anatomy = this.sideStyle(style, side);
			const dynamic = this.dynamic(mood, side);
			const innerX = anchor.x - side * width * 0.5
				- side * dynamic.squeeze * 2.3;
			const outerX = anchor.x + side * width * 0.5;
			const baseY = layout.brows.y + anatomy.vertical
				- dynamic.sideRaise * 3.2;
			return G.path(`${kind}_authored_brow_${side}`, [
				{
					type: 'move',
					x: innerX,
					y: baseY - dynamic.innerRaise * 4.6
						+ side * dynamic.tilt
				},
				{
					type: 'quad',
					cx: anchor.x,
					cy: baseY - 4 - anatomy.arch
						- Math.max(dynamic.innerRaise, dynamic.outerRaise) * 2.1,
					x: outerX,
					y: baseY - 2 - dynamic.outerRaise * 4.2
						- side * dynamic.tilt
				}
			], {
				stroke: style.color || colors.hairDark || colors.line,
				lineWidth: side === view.dir ? thickness : thickness * 0.82,
				lineCap: 'round'
			});
		});
	}

	static dynamic(mood, side) {
		const asymmetry = Number(mood.browAsymmetry || 0) * side;
		return {
			innerRaise: Number(mood.browInner || 0),
			outerRaise: Number(mood.browOuter || 0),
			squeeze: Number(mood.browPinch || 0),
			tilt: Number(mood.browTilt || 0) * 2.4,
			sideRaise: asymmetry
		};
	}

	static sideStyle(style, side) {
		const prefix = side < 0 ? 'left' : 'right';
		return {
			vertical: Number(style[`${prefix}VerticalOffset`] ?? style.verticalOffset ?? 0),
			arch: Number(style[`${prefix}Arch`] ?? style.arch ?? 0)
		};
	}
}
