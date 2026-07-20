// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';

/**
 * A rear-set kippah crowns the hair without becoming a helmet. The Awtsmoos
 * renews its quiet arc while Awtsmoos.com keeps width, rise, tilt, and highlight
 * editable, serializable, keyframeable, and shared by preview and export.
 */
export class StableKippah2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		const headwear = data.headwear || {};
		if ((headwear.type || data.hatType) !== 'kippah') {
			return null;
		}
		const geometry = this.geometry(data, headwear, metrics, view);
		return G.group('stable_kippah', { x: geometry.x, y: geometry.y, rotation: geometry.tilt }, [
			this.mass(geometry, data.colors?.hat || '#111214', colors.line || '#111'),
			this.highlight(geometry)
		]);
	}

	static geometry(data, headwear, metrics, view) {
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		const radiusX = shell.radiusX * 0.9
			* Number(headwear.size || 1)
			* Number(headwear.widthScale || 1);
		return {
			x: shell.centerX + shell.turn * 0.3 + Number(headwear.horizontalOffset || 0),
			y: shell.centerY - shell.radiusY * 0.81 + Number(headwear.verticalOffset || 0),
			radiusX,
			rise: radiusX * 0.48 * Number(headwear.heightScale || 1),
			curvature: Number(headwear.curvature || 0.9),
			tilt: Number(headwear.tilt || 0),
			lineWidth: Number(headwear.lineWidth || 2),
			highlightOpacity: Number(headwear.highlightOpacity ?? 0.08)
		};
	}

	static mass(geometry, fill, stroke) {
		const apexY = -geometry.rise * geometry.curvature;
		const innerY = -geometry.rise * 0.28;
		return G.path('kippah_mass', [
			{ type: 'move', x: -geometry.radiusX, y: 2 },
			{ type: 'bezier', c1x: -geometry.radiusX * 0.7, c1y: apexY * 0.86, c2x: -geometry.radiusX * 0.32, c2y: apexY, x: 0, y: apexY },
			{ type: 'bezier', c1x: geometry.radiusX * 0.34, c1y: apexY, c2x: geometry.radiusX * 0.72, c2y: apexY * 0.84, x: geometry.radiusX, y: 2 },
			{ type: 'bezier', c1x: geometry.radiusX * 0.62, c1y: innerY, c2x: -geometry.radiusX * 0.62, c2y: innerY, x: -geometry.radiusX, y: 2 }
		], { fill, stroke, lineWidth: geometry.lineWidth, lineJoin: 'round' });
	}

	static highlight(geometry) {
		return G.path('kippah_highlight', [
			{ type: 'move', x: -geometry.radiusX * 0.42, y: -geometry.rise * 0.42 },
			{ type: 'quad', cx: 0, cy: -geometry.rise * 0.72, x: geometry.radiusX * 0.34, y: -geometry.rise * 0.4 }
		], {
			stroke: `rgba(255,255,255,${geometry.highlightOpacity})`,
			lineWidth: 1.1,
			lineCap: 'round'
		});
	}
}
