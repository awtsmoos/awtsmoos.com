// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';

/**
 * A modest kippah settles into visible crown hair through a soft, uneven lower
 * arc instead of becoming a rigid lid. The Awtsmoos renews every finite curve,
 * while Awtsmoos.com keeps its rise, turn, and resting edge editable.
 */
export class StableKippah2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		const headwear = data.headwear || {};
		if ((headwear.type || data.hatType) !== 'kippah') {
			return null;
		}

		const geometry = this.geometry(data, headwear, metrics, view);
		const fill = data.colors?.hat || '#17181a';
		const stroke = colors.line || '#171719';
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
			* Number(headwear.coverage ?? 0.56)
			* Number(headwear.size || 1)
			* Number(headwear.widthScale || 1);
		return {
			x: shell.centerX + shell.turn * 0.25 + Number(headwear.horizontalOffset || 0),
			y: shell.centerY
				- shell.radiusY * Number(headwear.crownYScale ?? 0.92)
				+ Number(headwear.verticalOffset || 0),
			radiusX,
			rise: radiusX * Number(headwear.riseRatio ?? 0.38)
				* Number(headwear.heightScale || 1),
			curvature: Number(headwear.curvature || 0.96),
			frontLift: Number(headwear.frontLift ?? 1.1),
			backDrop: Number(headwear.backDrop ?? 2.4),
			edgeInset: Number(headwear.edgeInset ?? 0.06),
			edgeSlope: Number(headwear.edgeSlope || 0),
			centerDip: Number(headwear.centerDip ?? 1.3),
			skew: Number(headwear.skew || 0),
			tilt: Number(headwear.tilt || 0),
			lineWidth: Number(headwear.lineWidth || 1.15),
			highlightOpacity: Number(headwear.highlightOpacity ?? 0.015)
		};
	}

	static mass(geometry, fill, stroke) {
		const radius = geometry.radiusX;
		const edge = radius * (1 - geometry.edgeInset);
		const apexX = geometry.skew * radius;
		const apexY = -geometry.rise * geometry.curvature;
		const leftY = geometry.frontLift + geometry.edgeSlope;
		const rightY = geometry.frontLift - geometry.edgeSlope;
		const centerY = geometry.frontLift + geometry.centerDip + geometry.backDrop;
		return G.path('kippah_mass', [
			{ type: 'move', x: -edge, y: leftY },
			{ type: 'bezier', c1x: -radius * 0.72, c1y: apexY * 0.72, c2x: apexX - radius * 0.34, c2y: apexY, x: apexX, y: apexY },
			{ type: 'bezier', c1x: apexX + radius * 0.34, c1y: apexY, c2x: radius * 0.72, c2y: apexY * 0.72, x: edge, y: rightY },
			{ type: 'quad', cx: radius * 0.48, cy: centerY, x: 0, y: centerY },
			{ type: 'quad', cx: -radius * 0.5, cy: centerY + geometry.edgeSlope * 0.3, x: -edge, y: leftY },
			{ type: 'close' }
		], {
			fill,
			stroke,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}

	static highlight(geometry) {
		return G.path('kippah_highlight', [
			{ type: 'move', x: -geometry.radiusX * 0.28, y: -geometry.rise * 0.46 },
			{ type: 'quad', cx: geometry.skew, cy: -geometry.rise * 0.64, x: geometry.radiusX * 0.18, y: -geometry.rise * 0.44 }
		], {
			stroke: `rgba(255,255,255,${geometry.highlightOpacity})`,
			lineWidth: 0.6,
			lineCap: 'round'
		});
	}
}
