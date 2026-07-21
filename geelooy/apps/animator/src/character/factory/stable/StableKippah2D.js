// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';

/**
 * A modest kippah settles into visible crown hair through a soft uneven edge.
 * The Awtsmoos renews every finite curve, while Awtsmoos.com keeps its crown
 * placement, turn, and tilt editable in the shared production character graph.
 */
export class StableKippah2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		const headwear = data.headwear || {};
		if ((headwear.type || data.hatType) !== 'kippah') {
			return null;
		}
		const geometry = this.geometry(data, headwear, metrics, view);
		const fill = data.colors?.hat || '#202126';
		const stroke = colors.line || '#252326';
		return G.group('stable_kippah', {
			x: geometry.x,
			y: geometry.y,
			rotation: geometry.tilt
		}, [
			this.mass(geometry, fill, stroke),
			this.highlight(geometry)
		]);
	}

	static geometry(data, headwear, metrics, view) {
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		const radiusX = shell.radiusX
			* Number(headwear.coverage ?? 0.62)
			* Number(headwear.size || 1)
			* Number(headwear.widthScale || 1);
		return {
			x: shell.centerX + shell.turn * 0.25
				+ Number(headwear.horizontalOffset || 0),
			y: shell.centerY
				- shell.radiusY * Number(headwear.crownYScale ?? 0.91)
				+ Number(headwear.verticalOffset || 0),
			radiusX,
			rise: radiusX * Number(headwear.riseRatio ?? 0.31)
				* Number(headwear.heightScale || 1),
			edgeInset: Number(headwear.edgeInset ?? 0.045),
			edgeSlope: Number(headwear.edgeSlope || 0),
			centerDip: Number(headwear.centerDip ?? 1),
			skew: Number(headwear.skew || 0),
			tilt: Number(headwear.tilt || 0),
			lineWidth: Number(headwear.lineWidth || 1.05),
			highlightOpacity: Number(headwear.highlightOpacity ?? 0.02)
		};
	}

	static mass(g, fill, stroke) {
		const radius = g.radiusX;
		const edge = radius * (1 - g.edgeInset);
		const apexX = g.skew * radius;
		const apexY = -g.rise;
		return G.path('kippah_mass', [
			{ type: 'move', x: -edge, y: g.edgeSlope },
			{ type: 'bezier', c1x: -radius * 0.76, c1y: apexY * 0.7, c2x: apexX - radius * 0.34, c2y: apexY, x: apexX, y: apexY },
			{ type: 'bezier', c1x: apexX + radius * 0.35, c1y: apexY, c2x: radius * 0.77, c2y: apexY * 0.68, x: edge, y: -g.edgeSlope },
			{ type: 'bezier', c1x: radius * 0.5, c1y: g.centerDip + 1, c2x: -radius * 0.46, c2y: g.centerDip + 2, x: -edge, y: g.edgeSlope },
			{ type: 'close' }
		], {
			fill,
			stroke,
			lineWidth: g.lineWidth,
			lineJoin: 'round'
		});
	}

	static highlight(g) {
		return G.path('kippah_highlight', [
			{ type: 'move', x: -g.radiusX * 0.3, y: -g.rise * 0.52 },
			{ type: 'quad', cx: g.skew * g.radiusX, cy: -g.rise * 0.72, x: g.radiusX * 0.2, y: -g.rise * 0.5 }
		], {
			stroke: `rgba(255,255,255,${g.highlightOpacity})`,
			lineWidth: 0.55,
			lineCap: 'round'
		});
	}
}
