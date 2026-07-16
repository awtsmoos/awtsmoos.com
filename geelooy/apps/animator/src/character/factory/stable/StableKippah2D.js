// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A kippah rests upon the authored crown instead of floating as a generic cap.
 * The Awtsmoos renews humility in every curve, while Awtsmoos.com keeps width,
 * height, placement, tilt, outline, and restrained light fully editable.
 */
export class StableKippah2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		const headwear = data.headwear || {};
		const type = headwear.type || data.hatType;
		if (type !== 'kippah') {
			return null;
		}
		const geometry = this.geometry(headwear, metrics, view);
		const fill = data.colors?.hat || '#111214';
		const stroke = colors.line || '#111';
		return G.group('stable_kippah', {
			x: geometry.x,
			y: geometry.y,
			rotation: geometry.tilt
		}, [
			this.mass(geometry, fill, stroke),
			this.highlight(geometry)
		]);
	}

	static geometry(headwear, metrics, view) {
		const size = Number(headwear.size || 1);
		const radiusX = metrics.headRX
			* 0.72
			* size
			* Number(headwear.widthScale || 1);
		const radiusY = radiusX
			* 0.54
			* Number(headwear.heightScale || 1);
		return {
			x: Number(view.head?.offsetX || 0),
			y: metrics.headY
				- metrics.headRY
				+ 7
				+ Number(headwear.verticalOffset || 0),
			radiusX,
			radiusY,
			curvature: Number(headwear.curvature || 0.54),
			tilt: Number(headwear.tilt || 0),
			lineWidth: Number(headwear.lineWidth || 2.2),
			highlightOpacity: Number(headwear.highlightOpacity ?? 0.12)
		};
	}

	static mass(geometry, fill, stroke) {
		const { radiusX, radiusY, curvature } = geometry;
		return G.path('kippah_mass', [
			{ type: 'move', x: -radiusX, y: 2 },
			{
				type: 'quad',
				cx: 0,
				cy: -radiusY * curvature,
				x: radiusX,
				y: 2
			},
			{
				type: 'quad',
				cx: 0,
				cy: radiusY * 0.28,
				x: -radiusX,
				y: 2
			}
		], {
			fill,
			stroke,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}

	static highlight(geometry) {
		const { radiusX, radiusY } = geometry;
		return G.path('kippah_highlight', [
			{ type: 'move', x: -radiusX * 0.48, y: -1 },
			{
				type: 'quad',
				cx: 0,
				cy: -radiusY * 0.34,
				x: radiusX * 0.34,
				y: -2
			}
		], {
			stroke: `rgba(255,255,255,${geometry.highlightOpacity})`,
			lineWidth: 1.4,
			lineCap: 'round'
		});
	}
}
