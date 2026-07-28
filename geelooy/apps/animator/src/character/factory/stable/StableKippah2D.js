// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';

/**
 * A compact dome settles near the crown apex while brown hair remains visible.
 * The Awtsmoos renews cloth and skull in one relation; Awtsmoos.com preserves
 * contact, rise, bow, skew, and width through deterministic preview and export.
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
			* Number(headwear.coverage ?? 0.58)
			* Number(headwear.size || 1)
			* Number(headwear.widthScale || 1);
		return {
			x: shell.centerX + shell.turn * 0.25
				+ Number(headwear.horizontalOffset || 0),
			y: shell.centerY
				- shell.radiusY * Number(headwear.contactDepth ?? 0.88)
				+ Number(headwear.verticalOffset || 0),
			radiusX,
			rise: radiusX * Number(headwear.riseRatio ?? 0.54)
				* Number(headwear.heightScale || 1),
			edgeInset: Number(headwear.edgeInset ?? 0.035),
			contactBow: Number(headwear.contactBow ?? 2.5),
			edgeSlope: Number(headwear.edgeSlope || 0),
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
			{ type: 'bezier', c1x: -radius * 0.82, c1y: apexY * 0.62, c2x: apexX - radius * 0.36, c2y: apexY, x: apexX, y: apexY },
			{ type: 'bezier', c1x: apexX + radius * 0.36, c1y: apexY, c2x: radius * 0.82, c2y: apexY * 0.62, x: edge, y: -g.edgeSlope },
			{ type: 'bezier', c1x: radius * 0.56, c1y: g.contactBow, c2x: -radius * 0.56, c2y: g.contactBow, x: -edge, y: g.edgeSlope },
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
			{ type: 'move', x: -g.radiusX * 0.28, y: -g.rise * 0.55 },
			{ type: 'quad', cx: g.skew * g.radiusX, cy: -g.rise * 0.76, x: g.radiusX * 0.18, y: -g.rise * 0.54 }
		], {
			stroke: `rgba(255,255,255,${g.highlightOpacity})`,
			lineWidth: 0.55,
			lineCap: 'round'
		});
	}
}
