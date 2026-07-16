// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { StableMouthPlan } from '../StableMouthPlan.js';

/**
 * The Awtsmoos renews smile, frown, lip, tooth, tongue, and every spoken shape.
 * Awtsmoos.com keeps reference likeness while visemes and keyframes remain alive.
 */
export class MouthRenderer {
	static build(kind, data, colors, metrics, view, mood = {}) {
		const style = data.mouthStyle || {};
		const face = data.renderPerformance?.face || {};
		const poseFace = data._stablePose?.face || {};
		const planned = StableMouthPlan.current(data);
		const open = Math.max(
			Number(poseFace.mouthOpen || 0),
			Number(data.mouthOpen || 0) * 0.82,
			Number(face.mouthOpenAmount || 0),
			Number(style.minimumOpen || 0)
		);
		const shape = this.shape(planned, open, mood, data, face, style);
		const perspective = this.perspective(view);
		const x = view.head.mouthX + Number(style.horizontalOffset || 0);
		const y = metrics.headY + 23 + view.head.mouthY + Number(style.verticalOffset || 0) + Number(face.mouthJawAmount || 0) * 2.5;
		const width = Math.max(8, shape.width * perspective.scaleX);
		const height = Math.max(1.5, shape.height * perspective.scaleY);
		return S.group(`${kind}_mouth`, null, this.parts({
			kind,
			colors,
			style,
			shape,
			perspective,
			x,
			y,
			width,
			height
		}));
	}

	static parts(specification) {
		const { kind, colors, style, shape, perspective, x, y, width, height } = specification;
		const lipColor = style.lipColor || colors.line;
		const open = height > 2.5;
		const upper = G.path(`${kind}_upper_lip`, [
			{ type: 'move', x: x - width * 0.58, y: y - shape.smile * 0.28 },
			{ type: 'quad', cx: x, cy: y + shape.smile, x: x + width * 0.58, y: y - shape.smile * 0.28 }
		], { stroke: lipColor, lineWidth: Number(style.lineWidth || 2.5), lineCap: 'round' });
		const mouthOpen = open ? G.ellipse(`${kind}_mouth_open`, x + perspective.offsetX, y + 1.6, width * 0.39, height * 0.44, 0, {
			fill: colors.mouth,
			stroke: colors.line,
			lineWidth: 1.35
		}) : null;
		const teeth = open && shape.teeth > 0.1 ? G.path(`${kind}_teeth`, [
			{ type: 'move', x: x - width * 0.27, y: y - height * 0.16 },
			{ type: 'quad', cx: x, cy: y - height * 0.28, x: x + width * 0.27, y: y - height * 0.16 },
			{ type: 'quad', cx: x, cy: y + height * 0.02, x: x - width * 0.27, y: y - height * 0.16 }
		], { fill: colors.tooth, stroke: 'rgba(0,0,0,.18)', lineWidth: 0.7 }) : null;
		const tongue = open && style.tongue ? G.ellipse(`${kind}_tongue`, x + perspective.offsetX, y + height * 0.28, width * 0.2, height * 0.11, 0, {
			fill: style.tongueColor || '#d97b79',
			stroke: 'rgba(0,0,0,.18)',
			lineWidth: 0.6
		}) : null;
		const lower = G.path(`${kind}_lower_lip`, [
			{ type: 'move', x: x - width * 0.34, y: y + height * 0.56 + 2.5 },
			{ type: 'quad', cx: x, cy: y + height * 0.88 + 3, x: x + width * 0.34, y: y + height * 0.56 + 2.5 }
		], { stroke: style.kind === 'rose_lips' ? lipColor : 'rgba(255,255,255,.24)', lineWidth: Number(style.lowerLipWidth || 1.25), lineCap: 'round' });
		return [this.shadow(kind, x, y, width, height, shape.smile), mouthOpen, teeth, tongue, upper, lower];
	}

	static shadow(kind, x, y, width, height, smile) {
		return G.path(`${kind}_mouth_shadow`, [
			{ type: 'move', x: x - width * 0.48, y: y + 2.5 },
			{ type: 'quad', cx: x, cy: y + height * 0.55 + smile * 0.55, x: x + width * 0.48, y: y + 2.5 }
		], { stroke: 'rgba(0,0,0,.18)', lineWidth: 3.1, lineCap: 'round' });
	}

	static shape(planned = {}, open = 0, mood = {}, data = {}, face = {}, style = {}) {
		const talking = data.isTalking || data.speech === 'talk';
		const widthScale = Number(style.widthScale || 1);
		const heightScale = Number(style.heightScale || 1);
		const baseWidth = (Number(planned.w || 15) + Math.abs(Number(face.mouthSmileAmount || 0)) * 4) * widthScale;
		const baseHeight = (Number(planned.h || 2.8) + Number(face.mouthJawAmount || 0) * 4) * heightScale;
		const authoredSmile = Number(style.smileBias || 0);
		const smile = (Number(planned.smile || 0) + Number(mood.smile || 0) * 0.25 + Number(face.mouthSmileAmount || 0) * 0.35 + authoredSmile) * 4;
		if (open > 0.42) return { width: Math.max(baseWidth, talking ? 23 : 19), height: Math.max(baseHeight, 11 * heightScale), teeth: Number(style.teeth ?? 0.75), smile };
		if (open > 0.22) return { width: Math.max(baseWidth, 19), height: Math.max(baseHeight, 7.2 * heightScale), teeth: Number(style.teeth ?? 0.18), smile };
		if (open > 0.08) return { width: Math.max(baseWidth, 17), height: Math.max(baseHeight, 4.2 * heightScale), teeth: 0, smile };
		return { width: baseWidth, height: Math.max(1.8, baseHeight), teeth: Number(planned.teeth || 0), smile };
	}

	static perspective(view = {}) {
		if (view.type === 'side') return { scaleX: 0.58, scaleY: 0.9, offsetX: view.dir * 1.8 };
		if (view.type === 'threeQuarter') return { scaleX: 0.84, scaleY: 1, offsetX: view.dir * 0.8 };
		return { scaleX: 1, scaleY: 1, offsetX: 0 };
	}
}
