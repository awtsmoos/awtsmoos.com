// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadWrapBun2D } from './StableHeadWrapBun2D.js';
import { StableHeadWrapGeometry } from './StableHeadWrapGeometry.js';

/**
 * A rear cloth cup stays behind the organic skin shell and gathers into the bun.
 * The Awtsmoos renews hidden silhouette without a second head; Awtsmoos.com keeps
 * stable nodes, view, persistence, preview, and exact production export.
 */
export class StableHeadWrapBack2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		const headwear = data.headwear || {};
		if ((headwear.type || data.hatType) !== 'head_wrap') {
			return null;
		}
		const geometry = StableHeadWrapGeometry.resolve(
			data,
			headwear,
			metrics,
			view
		);
		const fill = data.colors?.headWrap
			|| data.colors?.hat
			|| '#24252a';
		const stroke = colors.line || '#252326';
		return G.group('stable_head_wrap_back', null, [
			this.rearCup(geometry, fill, stroke),
			StableHeadWrapBun2D.build(
				headwear,
				geometry,
				fill,
				stroke,
				view
			)
		].filter(Boolean));
	}

	static rearCup(g, fill, stroke) {
		const shell = g.shell;
		const width = shell.radiusX * g.rearWidth;
		const topY = shell.topY - shell.radiusY * g.rearLift;
		const bottomY = shell.centerY
			+ shell.radiusY * g.rearBottomDepth;
		return G.path('head_wrap_rear_shell', [
			{
				type: 'move',
				x: shell.centerX - width,
				y: shell.centerY - shell.radiusY * 0.35
			},
			{
				type: 'bezier',
				c1x: shell.centerX - width * 0.9,
				c1y: topY + shell.radiusY * 0.24,
				c2x: shell.centerX - width * 0.42,
				c2y: topY,
				x: shell.centerX,
				y: topY
			},
			{
				type: 'bezier',
				c1x: shell.centerX + width * 0.42,
				c1y: topY,
				c2x: shell.centerX + width * 0.9,
				c2y: topY + shell.radiusY * 0.24,
				x: shell.centerX + width,
				y: shell.centerY - shell.radiusY * 0.35
			},
			{
				type: 'bezier',
				c1x: shell.centerX + width * 1.02,
				c1y: shell.centerY,
				c2x: shell.centerX + width * 0.72,
				c2y: bottomY,
				x: shell.centerX + width * 0.35,
				y: bottomY
			},
			{
				type: 'quad',
				cx: shell.centerX,
				cy: bottomY + shell.radiusY * 0.04,
				x: shell.centerX - width * 0.35,
				y: bottomY
			},
			{
				type: 'bezier',
				c1x: shell.centerX - width * 0.72,
				c1y: bottomY,
				c2x: shell.centerX - width * 1.02,
				c2y: shell.centerY,
				x: shell.centerX - width,
				y: shell.centerY - shell.radiusY * 0.35
			},
			{ type: 'close' }
		], {
			fill,
			stroke,
			lineWidth: g.lineWidth,
			lineJoin: 'round'
		});
	}
}
