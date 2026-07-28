// B"H
// Boruch Hashem
// Blessed is He

import { StableEyeAttention } from './StableEyeAttention.js';
import { StableEyeSideStyle } from './StableEyeSideStyle.js';
import { StableFaceLandmarkLayout } from './StableFaceLandmarkLayout.js';

/**
 * Each eye inhabits the measured skull while retaining its own gaze and lid.
 * The Awtsmoos joins identity and attention; Awtsmoos.com keeps every finite
 * blink, pupil, asymmetry, save, reload, preview, and export deterministic.
 */
export class StableEyeGeometry {
	static resolve(data = {}, metrics = {}, view = {}, mood = {}, blink = 0, side = 1) {
		const style = data.eyeStyle || {};
		const authored = StableEyeSideStyle.resolve(style, side);
		const layout = StableFaceLandmarkLayout.resolve(data, metrics, view);
		const anchor = StableFaceLandmarkLayout.eye(layout, side, view);
		const near = side === view.dir;
		const perspective = near
			? Number(view.head.nearEyeScale || 1)
			: Number(view.head.farEyeScale || 1);
		const spacing = Math.max(0.7, Number(style.spacingScale || 1));
		const centerX = layout.shell.centerX
			+ (anchor.x - layout.shell.centerX) * spacing;
		const centerDistance = Math.max(7, Math.abs(centerX - layout.shell.centerX));
		const width = this.width(style, authored, perspective, centerDistance);
		const lid = this.lid(mood, blink, data);
		const height = this.height(style, authored, perspective, width, lid, data);
		const gaze = StableEyeAttention.gaze(data, view, style);
		return {
			x: centerX + Number(style.horizontalOffset || 0) + authored.horizontalOffset,
			y: anchor.y + Number(style.verticalOffset || 0)
				+ authored.verticalOffset + (near ? 0 : 0.6),
			width,
			height,
			lid,
			perspective,
			pupilScale: Number(style.pupilScale || 1),
			pupilX: this.pupilX(gaze, view, authored, width, perspective),
			pupilY: this.pupilY(gaze, style, authored, height),
			rotation: Number(style.rotation || 0) * side + authored.rotation,
			style: { ...style, lidDrop: authored.lidDrop }
		};
	}

	static width(style, authored, perspective, centerDistance) {
		const requested = Number(style.radiusX || 9.4) * perspective
			* Number(style.widthScale || 1) * authored.widthScale;
		return Math.min(requested, centerDistance * Number(style.separationRatio || 0.82));
	}

	static height(style, authored, perspective, width, lid, data) {
		const openness = Number(data.renderPerformance?.face?.eyeOpenAmount ?? 1);
		const requested = Number(style.radiusY || 8.2) * perspective
			* Number(style.heightScale || 1) * authored.heightScale
			* Math.max(0.15, openness) * lid;
		return Math.max(1.1, Math.min(requested, width * Number(style.maxAspect || 1.08)));
	}

	static pupilX(gaze, view, authored, width, perspective) {
		return StableEyeAttention.clamp(
			gaze.x * 3.4 + Number(view.dir || 1) * 0.7 * perspective
				+ authored.pupilOffsetX,
			-width * 0.43,
			width * 0.43
		);
	}

	static pupilY(gaze, style, authored, height) {
		return StableEyeAttention.clamp(
			gaze.y * 1.7 + Number(style.pupilVertical || 0.5)
				+ authored.pupilOffsetY,
			-height * 0.24,
			height * 0.36
		);
	}

	static lid(mood = {}, blink = 0, data = {}) {
		const face = data.renderPerformance?.face || {};
		return StableEyeAttention.clamp(
			1 - Math.max(blink, face.blinkAmount || 0)
				- Number(mood.squint || 0) - Number(face.squintAmount || 0),
			0.08,
			1.12
		);
	}
}
