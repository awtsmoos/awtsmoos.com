// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { StableEyeGeometry } from './StableEyeGeometry.js';

/**
 * The Awtsmoos renews two distinct eyes, each carrying gaze, lid, pupil, lash, and
 * catchlight. Awtsmoos.com renders resolved production geometry while blink and
 * attention remain keyframeable, serializable, reloadable, and exportable.
 */
export class EyeRenderer {
	static build(kind, colors, metrics, view, mood = {}, blink = 0, data = {}) {
		return (view.head.visibleEyes || [-1, 1]).map(side => this.eye(
			kind,
			colors,
			side,
			StableEyeGeometry.resolve(data, metrics, view, mood, blink, side)
		));
	}

	static eye(kind, colors, side, geometry) {
		const style = geometry.style;
		return S.group(`${kind}_eye_${side}`, { x: geometry.x, y: geometry.y }, [
			G.ellipse(`${kind}_eye_white_${side}`, 0, 0, geometry.width, geometry.height, geometry.rotation, {
				fill: colors.eyeLight,
				stroke: colors.line,
				lineWidth: Number(style.outlineWidth || 1.9)
			}),
			G.circle(`${kind}_pupil_${side}`, geometry.pupilX, geometry.pupilY, Math.max(1.5, 2.55 * geometry.perspective * geometry.pupilScale), {
				fill: colors.eye,
				stroke: colors.eye,
				lineWidth: 1
			}),
			G.circle(`${kind}_catchlight_${side}`, geometry.pupilX - 0.8 * geometry.perspective, geometry.pupilY - 0.9 * geometry.perspective, Math.max(0.55, 0.9 * geometry.perspective * geometry.pupilScale), {
				fill: 'rgba(255,255,255,0.88)',
				stroke: 'rgba(0,0,0,0)',
				lineWidth: 0
			}),
			this.upperLid(kind, side, geometry, colors),
			...this.lashes(kind, side, geometry, colors),
			geometry.lid < 0.28
				? this.blinkLine(kind, side, geometry.width, colors)
				: null
		]);
	}

	static upperLid(kind, side, geometry, colors) {
		const drop = Number(geometry.style.lidDrop || 0);
		return G.path(`${kind}_upper_lid_${side}`, [
			{ type: 'move', x: -geometry.width, y: -geometry.height * (0.62 - drop) },
			{ type: 'quad', cx: 0, cy: -geometry.height * (1.45 - drop * 0.7), x: geometry.width, y: -geometry.height * (0.62 - drop) }
		], { stroke: colors.line, lineWidth: Number(geometry.style.lidWidth || 1.8), lineCap: 'round' });
	}

	static lashes(kind, side, geometry, colors) {
		if (!geometry.style.lashes) {
			return [];
		}
		const outer = side > 0 ? geometry.width : -geometry.width;
		const direction = side > 0 ? 1 : -1;
		return [0, 1, 2].map(index => G.path(`${kind}_lash_${side}_${index}`, [
			{ type: 'move', x: outer - direction * index * 1.7, y: -geometry.height * 0.7 + index * 0.6 },
			{ type: 'line', x: outer + direction * (3.4 - index * 0.4), y: -geometry.height - 2.6 + index * 0.8 }
		], { stroke: colors.line, lineWidth: 1.15, lineCap: 'round' }));
	}

	static blinkLine(kind, side, width, colors) {
		return G.path(`${kind}_blink_line_${side}`, [
			{ type: 'move', x: -width, y: 0 },
			{ type: 'quad', cx: 0, cy: 1.2, x: width, y: 0 }
		], { stroke: colors.line, lineWidth: 2.2, lineCap: 'round' });
	}
}
