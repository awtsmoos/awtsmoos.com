// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableKippahGeometry } from './StableKippahGeometry.js';

/**
 * A compact cloth dome rests on sampled crown contact instead of floating above it.
 * The Awtsmoos renews skull and vessel together; Awtsmoos.com preserves stable
 * nodes, view, tilt, persistence, preview, and exact production export.
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
			this.contact(geometry, stroke),
			this.highlight(geometry)
		]);
	}

	static geometry(data, headwear, metrics, view) {
		return StableKippahGeometry.resolve(
			{ ...data, headwear },
			metrics,
			view
		);
	}

	static mass(g, fill, stroke) {
		const radius = g.radiusX;
		const apexX = g.skew * radius;
		return G.path('kippah_mass', [
			{ type: 'move', x: -radius, y: g.leftContactY },
			{ type: 'bezier', c1x: -radius * 0.72, c1y: -g.rise * 0.72, c2x: apexX - radius * 0.3, c2y: -g.rise, x: apexX, y: -g.rise },
			{ type: 'bezier', c1x: apexX + radius * 0.3, c1y: -g.rise, c2x: radius * 0.72, c2y: -g.rise * 0.72, x: radius, y: g.rightContactY },
			{ type: 'quad', cx: radius * 0.48, cy: 0, x: 0, y: 0 },
			{ type: 'quad', cx: -radius * 0.48, cy: 0, x: -radius, y: g.leftContactY },
			{ type: 'close' }
		], { fill, stroke, lineWidth: g.lineWidth, lineJoin: 'round' });
	}

	static contact(g, stroke) {
		return G.path('kippah_contact_seam', [
			{ type: 'move', x: -g.radiusX, y: g.leftContactY },
			{ type: 'quad', cx: -g.radiusX * 0.48, cy: 0, x: 0, y: 0 },
			{ type: 'quad', cx: g.radiusX * 0.48, cy: 0, x: g.radiusX, y: g.rightContactY }
		], { stroke, lineWidth: Math.max(0.45, g.lineWidth * 0.72), lineCap: 'round' });
	}

	static highlight(g) {
		return G.path('kippah_highlight', [
			{ type: 'move', x: -g.radiusX * 0.18, y: -g.rise * 0.56 },
			{ type: 'quad', cx: 0, cy: -g.rise * 0.82, x: g.radiusX * 0.14, y: -g.rise * 0.54 }
		], {
			stroke: `rgba(255,255,255,${g.highlightOpacity})`,
			lineWidth: 0.45,
			lineCap: 'round'
		});
	}
}
