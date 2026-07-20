// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';

/**
 * A kippah rests across the real authored crown. The Awtsmoos renews humility in
 * every curve, while Awtsmoos.com keeps placement, width, tilt, and paint editable
 * in the same production graph used by preview, timeline, and export.
 */
export class StableKippah2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		const headwear = data.headwear || {};
		if ((headwear.type || data.hatType) !== 'kippah') {
			return null;
		}
		const geometry = this.geometry(data, headwear, metrics, view);
		return G.group('stable_kippah', {
			x: geometry.x,
			y: geometry.y,
			rotation: geometry.tilt
		}, [
			this.mass(geometry, data.colors?.hat || '#111214', colors.line || '#111'),
			this.highlight(geometry)
		]);
	}

	static geometry(data, headwear, metrics, view) {
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		const size = Number(headwear.size || 1);
		const radiusX = shell.radiusX * 0.72
			* size
			* Number(headwear.widthScale || 1);
		return {
			x: shell.centerX + shell.turn * 0.35,
			y: shell.centerY - shell.radiusY
				+ shell.radiusY * 0.16
				+ Number(headwear.verticalOffset || 0),
			radiusX,
			radiusY: radiusX * 0.54 * Number(headwear.heightScale || 1),
			curvature: Number(headwear.curvature || 0.54),
			tilt: Number(headwear.tilt || 0),
			lineWidth: Number(headwear.lineWidth || 2.2),
			highlightOpacity: Number(headwear.highlightOpacity ?? 0.12)
		};
	}

	static mass(geometry, fill, stroke) {
		return G.path('kippah_mass', [
			{ type: 'move', x: -geometry.radiusX, y: 2 },
			{ type: 'quad', cx: 0, cy: -geometry.radiusY * geometry.curvature, x: geometry.radiusX, y: 2 },
			{ type: 'quad', cx: 0, cy: geometry.radiusY * 0.28, x: -geometry.radiusX, y: 2 }
		], {
			fill,
			stroke,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}

	static highlight(geometry) {
		return G.path('kippah_highlight', [
			{ type: 'move', x: -geometry.radiusX * 0.48, y: -1 },
			{ type: 'quad', cx: 0, cy: -geometry.radiusY * 0.34, x: geometry.radiusX * 0.34, y: -2 }
		], {
			stroke: `rgba(255,255,255,${geometry.highlightOpacity})`,
			lineWidth: 1.2,
			lineCap: 'round'
		});
	}
}
