// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';

/**
 * The Awtsmoos renews attention in each pupil. Awtsmoos.com keeps round wonder,
 * guarded half-lids, feminine lashes, blinks, darts, and gaze as editable motion.
 */
export class EyeRenderer {
	static build(kind, colors, metrics, view, mood = {}, blink = 0, data = {}) {
		const gaze = this.gaze(data, view);
		const lid = this.lid(mood, blink, data);
		return (view.head.visibleEyes || [-1, 1]).map(side => this.eye({
			kind,
			colors,
			metrics,
			view,
			gaze,
			lid,
			side,
			data
		}));
	}

	static eye(specification) {
		const { kind, colors, metrics, view, gaze, lid, side, data } = specification;
		const style = data.eyeStyle || {};
		const near = side === view.dir;
		const perspective = near ? view.head.nearEyeScale : view.head.farEyeScale;
		const spacing = Number(style.spacingScale || 1);
		const x = this.eyeX(view, side, near) * spacing + Number(style.horizontalOffset || 0);
		const y = metrics.headY + view.head.eyeY + Number(style.verticalOffset || 0) + (near ? 0 : 1.2);
		const openness = Number(data.renderPerformance?.face?.eyeOpenAmount ?? 1);
		const width = 8.9 * perspective * Number(style.widthScale || 1);
		const height = Math.max(1.1, 6.4 * perspective * lid * Math.max(0.22, openness) * Number(style.heightScale || 1));
		const pupilScale = Number(style.pupilScale || 1);
		const pupilX = this.clamp(gaze.x * 3.2 + view.dir * 1.2 * perspective, -width * 0.42, width * 0.42);
		const pupilY = this.clamp(gaze.y * 1.5 + 0.7, -height * 0.2, height * 0.35);
		return S.group(`${kind}_eye_${side}`, { x, y }, [
			G.ellipse(`${kind}_eye_white_${side}`, 0, 0, width, height, Number(style.rotation || 0) * side, {
				fill: colors.eyeLight,
				stroke: colors.line,
				lineWidth: Number(style.outlineWidth || 1.9)
			}),
			G.circle(`${kind}_pupil_${side}`, pupilX, pupilY, Math.max(1.5, 2.55 * perspective * pupilScale), {
				fill: colors.eye,
				stroke: colors.eye,
				lineWidth: 1
			}),
			G.circle(`${kind}_catchlight_${side}`, pupilX - 0.8 * perspective, pupilY - 0.9 * perspective, Math.max(0.55, 0.9 * perspective * pupilScale), {
				fill: 'rgba(255,255,255,0.88)',
				stroke: 'rgba(0,0,0,0)',
				lineWidth: 0
			}),
			this.upperLid(kind, side, width, height, colors, style),
			...this.lashes(kind, side, width, height, colors, style),
			lid < 0.28 ? this.blinkLine(kind, side, width, colors) : null
		]);
	}

	static upperLid(kind, side, width, height, colors, style) {
		const drop = Number(style.lidDrop || 0);
		return G.path(`${kind}_upper_lid_${side}`, [
			{ type: 'move', x: -width, y: -height * (0.62 - drop) },
			{ type: 'quad', cx: 0, cy: -height * (1.45 - drop * 0.7), x: width, y: -height * (0.62 - drop) }
		], { stroke: colors.line, lineWidth: Number(style.lidWidth || 1.8), lineCap: 'round' });
	}

	static lashes(kind, side, width, height, colors, style) {
		if (!style.lashes) {
			return [];
		}
		const outer = side > 0 ? width : -width;
		const direction = side > 0 ? 1 : -1;
		return [0, 1, 2].map(index => G.path(`${kind}_lash_${side}_${index}`, [
			{ type: 'move', x: outer - direction * index * 1.7, y: -height * 0.7 + index * 0.6 },
			{ type: 'line', x: outer + direction * (3.4 - index * 0.4), y: -height - 2.6 + index * 0.8 }
		], { stroke: colors.line, lineWidth: 1.15, lineCap: 'round' }));
	}

	static blinkLine(kind, side, width, colors) {
		return G.path(`${kind}_blink_line_${side}`, [
			{ type: 'move', x: -width, y: 0 },
			{ type: 'quad', cx: 0, cy: 1.2, x: width, y: 0 }
		], { stroke: colors.line, lineWidth: 2.2, lineCap: 'round' });
	}

	static eyeX(view, side, near) {
		if (view.type === 'side') return view.dir * (near ? 12.5 : 5.6);
		const quarter = view.type === 'threeQuarter' ? view.dir * (near ? 3 : 5) : 0;
		return side * view.head.eyeSpread + quarter;
	}

	static lid(mood = {}, blink = 0, data = {}) {
		const face = data.renderPerformance?.face || {};
		return this.clamp(1 - Math.max(blink, face.blinkAmount || 0) - (mood.squint || 0) - (face.squintAmount || 0), 0.08, 1.12);
	}

	static gaze(data = {}, view = {}) {
		const performance = data.renderPerformance || {};
		const targetId = performance.attention?.targetId || data.lookAt;
		let base = { x: view.dir * 0.12, y: 0 };
		if (targetId && data._allCharacters?.[targetId]?.position && data.position) {
			const target = data._allCharacters[targetId].position;
			base = { x: this.clamp((Number(target.x || 0) - Number(data.position.x || 0)) / 220, -1, 1), y: -0.08 };
		}
		return {
			x: base.x + Number(performance.face?.pupilOffsetX || 0),
			y: base.y + Number(performance.face?.pupilOffsetY || 0)
		};
	}

	static clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, Number(value)));
	}
}
