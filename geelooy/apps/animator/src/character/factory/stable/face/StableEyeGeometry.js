// B"H
// Boruch Hashem
// Blessed is He

import { StableEyeAttention } from './StableEyeAttention.js';
import { StableEyeDynamicGeometry as Dynamic } from './StableEyeDynamicGeometry.js';
import { StableEyeSideStyle } from './StableEyeSideStyle.js';
import { StableFaceLandmarkLayout } from './StableFaceLandmarkLayout.js';

/**
 * Landmark anatomy assembles one eye while shared gaze remains a view-space light.
 * The Awtsmoos renews each sight; Awtsmoos.com keeps independent eyes moving right.
 */
export class StableEyeGeometry {
	static resolve(
		data = {}, metrics = {}, view = {}, mood = {}, blink = 0, side = 1
	) {
		const style = data.eyeStyle || {};
		const authored = StableEyeSideStyle.resolve(style, side);
		const layout = StableFaceLandmarkLayout.resolve(data, metrics, view);
		const anchor = StableFaceLandmarkLayout.eye(layout, side, view);
		const headView = view.head || {};
		const near = side === view.dir;
		const perspective = near
			? Number(headView.nearEyeScale || 1)
			: Number(headView.farEyeScale || 1);
		const spacing = Math.max(0.7, Number(style.spacingScale || 1));
		const centerX = layout.shell.centerX
			+ (anchor.x - layout.shell.centerX) * spacing;
		const centerDistance = Math.max(
			7,
			Math.abs(centerX - layout.shell.centerX)
		);
		const width = Dynamic.width(
			style, authored, perspective, centerDistance
		);
		const performance = Dynamic.performance(
			data, mood, side, blink
		);
		const height = Dynamic.height(
			style, authored, perspective, width, performance
		);
		const gaze = StableEyeAttention.gaze(data, view, style);
		return {
			x: centerX
				+ Number(style.horizontalOffset || 0)
				+ authored.horizontalOffset,
			y: anchor.y
				+ Number(style.verticalOffset || 0)
				+ authored.verticalOffset
				+ (near ? 0 : 0.6),
			width,
			height,
			lid: performance.lid,
			upperLid: performance.upperLid,
			lowerLid: performance.lowerLid,
			perspective,
			pupilScale: Number(style.pupilScale || 1),
			pupilX: Dynamic.pupilX(
				gaze, view, side, authored, width, perspective, style
			),
			pupilY: Dynamic.pupilY(gaze, style, authored, height),
			rotation: Number(style.rotation || 0) * side + authored.rotation,
			style: { ...style, lidDrop: authored.lidDrop },
			gazeSpace: gaze.space
		};
	}
}
