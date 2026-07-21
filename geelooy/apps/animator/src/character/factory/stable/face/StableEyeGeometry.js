// B"H
// Boruch Hashem
// Blessed is He

import { StableEyeAttention } from './StableEyeAttention.js';
import { StableEyeSideStyle } from './StableEyeSideStyle.js';

/**
 * The Awtsmoos gives each eye its own white vessel, living pupil, and expressive
 * lid. Awtsmoos.com joins authored asymmetry to live attention so blink, gaze,
 * save, reload, preview, and export remain one deterministic production system.
 */
export class StableEyeGeometry {
	static resolve(data = {}, metrics = {}, view = {}, mood = {}, blink = 0, side = 1) {
		const style = data.eyeStyle || {};
		const authored = StableEyeSideStyle.resolve(style, side);
		const near = side === view.dir;
		const perspective = near
			? Number(view.head.nearEyeScale || 1)
			: Number(view.head.farEyeScale || 1);
		const spacing = Math.max(0.7, Number(style.spacingScale || 1));
		const baseCenter = this.eyeX(view, side, near);
		const centerDistance = Math.max(7, Math.abs(baseCenter * spacing));
		const width = this.width(style, authored, perspective, centerDistance);
		const lid = this.lid(mood, blink, data);
		const height = this.height(style, authored, perspective, width, lid, data);
		const gaze = StableEyeAttention.gaze(data, view, style);
		return {
			x: baseCenter * spacing
				+ Number(style.horizontalOffset || 0)
				+ authored.horizontalOffset,
			y: metrics.headY
				+ Number(view.head.eyeY || 0)
				+ Number(style.verticalOffset || 0)
				+ authored.verticalOffset
				+ (near ? 0 : 0.8),
			width,
			height,
			lid,
			perspective,
			pupilScale: Number(style.pupilScale || 1),
			pupilX: this.pupilX(gaze, view, authored, width, perspective),
			pupilY: this.pupilY(gaze, style, authored, height),
			rotation: Number(style.rotation || 0) * side + authored.rotation,
			style: {
				...style,
				lidDrop: authored.lidDrop
			}
		};
	}

	static width(style, authored, perspective, centerDistance) {
		const requested = Number(style.radiusX || 9.4)
			* perspective
			* Number(style.widthScale || 1)
			* authored.widthScale;
		return Math.min(
			requested,
			centerDistance * Number(style.separationRatio || 0.74)
		);
	}

	static height(style, authored, perspective, width, lid, data) {
		const openness = Number(data.renderPerformance?.face?.eyeOpenAmount ?? 1);
		const requested = Number(style.radiusY || 8.2)
			* perspective
			* Number(style.heightScale || 1)
			* authored.heightScale
			* Math.max(0.15, openness)
			* lid;
		return Math.max(
			1.1,
			Math.min(requested, width * Number(style.maxAspect || 1.08))
		);
	}

	static pupilX(gaze, view, authored, width, perspective) {
		return StableEyeAttention.clamp(
			gaze.x * 3.4
				+ Number(view.dir || 1) * 0.7 * perspective
				+ authored.pupilOffsetX,
			-width * 0.43,
			width * 0.43
		);
	}

	static pupilY(gaze, style, authored, height) {
		return StableEyeAttention.clamp(
			gaze.y * 1.7
				+ Number(style.pupilVertical || 0.5)
				+ authored.pupilOffsetY,
			-height * 0.24,
			height * 0.36
		);
	}

	static eyeX(view, side, near) {
		if (view.type === 'side') {
			return Number(view.dir || 1) * (near ? 12.5 : 5.6);
		}
		const quarter = view.type === 'threeQuarter'
			? Number(view.dir || 1) * (near ? 3 : 5)
			: 0;
		return side * Number(view.head.eyeSpread || 11) + quarter;
	}

	static lid(mood = {}, blink = 0, data = {}) {
		const face = data.renderPerformance?.face || {};
		return StableEyeAttention.clamp(
			1 - Math.max(blink, face.blinkAmount || 0)
				- Number(mood.squint || 0)
				- Number(face.squintAmount || 0),
			0.08,
			1.12
		);
	}
}
