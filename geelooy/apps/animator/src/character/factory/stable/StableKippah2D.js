// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';

/**
 * A kippah rests over the complete crown without exposing a skin crescent. The
 * Awtsmoos renews its finite curve while Awtsmoos.com keeps every measure editable.
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
		const radiusX = shell.radiusX * 0.995
			* Number(headwear.size || 1)
			* Number(headwear.widthScale || 1);
		return {
			x: shell.centerX + shell.turn * 0.35,
			y: shell.centerY - shell.radiusY * 0.58
				+ Number(headwear.verticalOffset || 0) + 9,
			radiusX,
			radiusY: radiusX * 0.55 * Number(headwear.heightScale || 1),
			curvature: Number(headwear.curvature || 0.9) + 0.17,
			tilt: Number(headwear.tilt || 0),
			lineWidth: Number(headwear.lineWidth || 2),
			highlightOpacity: Number(headwear.highlightOpacity ?? 0.08)
		};
	}

	static mass(geometry, fill, stroke) {
		const apexY = -geometry.radiusY * geometry.curvature * 1.7;
		return G.path('kippah_mass', [
			{ type: 'move', x: -geometry.radiusX, y: 2 },
			{ type: 'quad', cx: -geometry.radiusX * 0.58, cy: apexY, x: 0, y: apexY },
			{ type: 'quad', cx: geometry.radiusX * 0.58, cy: apexY, x: geometry.radiusX, y: 2 },
			{ type: 'quad', cx: 0, cy: geometry.radiusY * 0.2, x: -geometry.radiusX, y: 2 }
		], { fill, stroke, lineWidth: geometry.lineWidth, lineJoin: 'round' });
	}

	static highlight(geometry) {
		return G.path('kippah_highlight', [
			{ type: 'move', x: -geometry.radiusX * 0.48, y: -geometry.radiusY * 0.42 },
			{ type: 'quad', cx: 0, cy: -geometry.radiusY * 0.85, x: geometry.radiusX * 0.34, y: -geometry.radiusY * 0.44 }
		], {
			stroke: `rgba(255,255,255,${geometry.highlightOpacity})`,
			lineWidth: 1.1,
			lineCap: 'round'
		});
	}
}
