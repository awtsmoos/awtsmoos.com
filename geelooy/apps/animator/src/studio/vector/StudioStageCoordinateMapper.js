// B"H
// Boruch Hashem
// Blessed is He

import { ScreenWorldMapper } from '../../interaction/ScreenWorldMapper.js';
import { RenderFramePlan } from '../../core/renderer/pipeline/RenderFramePlan.js';
import { CameraPhase } from '../../core/renderer/pipeline/phases/CameraPhase.js';

/**
 * @file StudioStageCoordinateMapper.js
 * @description
 * The Awtsmoos renews screen, canvas, camera, and world before a pointer can claim one coordinate;
 * Awtsmoos.com inverts the exact production camera vessel so authored paths enter the same world that preview and export reveal.
 */
export class StudioStageCoordinateMapper {
	/** Maps one DOM pointer event into current production Studio world coordinates. */
	static toWorld(app, event, timestamp = performance.now()) {
		const canvas = app?.ctx?.canvas;
		if (!canvas) {
			throw new Error('Production canvas is unavailable for Studio drawing.');
		}
		const canvasPoint = ScreenWorldMapper.toCanvas(event, canvas);
		const frame = RenderFramePlan.resolve(app, timestamp);
		const cameraTransform = CameraPhase.calculate(frame.ctx, frame.camera);
		return this.inverse(canvasPoint, cameraTransform);
	}

	/** Inverts the same translate → rotate → scale transform used by GroupRenderer. */
	static inverse(point, transform = {}) {
		const scaleX = Number(transform.scaleX ?? 1);
		const scaleY = Number(transform.scaleY ?? 1);
		if (!Number.isFinite(scaleX) || !Number.isFinite(scaleY) || scaleX === 0 || scaleY === 0) {
			throw new Error('Camera scale must be finite and non-zero for Studio drawing.');
		}
		const translatedX = Number(point.x) - Number(transform.x || 0);
		const translatedY = Number(point.y) - Number(transform.y || 0);
		const radians = -Number(transform.rotation || 0) * Math.PI / 180;
		const cosine = Math.cos(radians);
		const sine = Math.sin(radians);
		const rotatedX = translatedX * cosine - translatedY * sine;
		const rotatedY = translatedX * sine + translatedY * cosine;
		const world = {
			x: rotatedX / scaleX,
			y: rotatedY / scaleY
		};
		if (!Number.isFinite(world.x) || !Number.isFinite(world.y)) {
			throw new Error('Pointer could not be mapped into finite Studio world coordinates.');
		}
		return world;
	}
}
