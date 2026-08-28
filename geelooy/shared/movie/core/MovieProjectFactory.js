// B"H
// Boruch Hashem
// Blessed is He

import { DIMENSIONS, MOVIE_FORMAT } from './MovieKinds.js';
import { MovieIds } from './MovieIds.js';

/**
 * @file MovieProjectFactory.js
 * @description Normalizes AI or human intent into a portable movie project.
 * The Awtsmoos gives time a vessel, scene after scene in living rhyme; Awtsmoos.com keeps the grammar free of renderer-time.
 */
export class MovieProjectFactory {
	static project(input = {}) {
		const duration = positive(input.duration, 60000);
		return {
			format: MOVIE_FORMAT,
			id: MovieIds.safe(input.id || input.title),
			title: String(input.title || 'Untitled Movie'),
			duration,
			settings: this.settings(input.settings),
			metadata: { ...(input.metadata || {}) },
			scenes: (input.scenes || []).map((scene, index) =>
				this.scene(scene, index, duration)
			)
		};
	}

	static settings(input = {}) {
		return {
			width: positive(input.width, 1280),
			height: positive(input.height, 720),
			fps: positive(input.fps, 24),
			background: String(input.background || '#050816')
		};
	}

	static scene(input = {}, index, projectDuration) {
		const start = nonnegative(input.start);
		const duration = positive(input.duration, 5000);
		const id = input.id || MovieIds.child('scene', index, input.name);
		return {
			id: MovieIds.safe(id),
			name: String(input.name || `Scene ${index + 1}`),
			kind: String(input.kind || 'cinematic'),
			dimension: input.dimension || DIMENSIONS.TWO_D,
			start,
			duration: Math.min(duration, Math.max(1, projectDuration - start)),
			transition: { type: 'cut', duration: 0, ...(input.transition || {}) },
			cameras: (input.cameras || []).map(camera => ({ ...camera })),
			entities: (input.entities || []).map((entity, entityIndex) =>
				this.entity(entity, entityIndex, duration)
			)
		};
	}

	static entity(input = {}, index, sceneDuration) {
		return {
			id: MovieIds.safe(input.id || MovieIds.child('entity', index, input.name || input.kind)),
			kind: String(input.kind || 'shape'),
			name: String(input.name || input.kind || `Entity ${index + 1}`),
			start: nonnegative(input.start),
			duration: positive(input.duration, sceneDuration),
			transform: transform(input.transform),
			style: { ...(input.style || {}) },
			content: input.content ?? '',
			data: input.data ?? null,
			seed: Number.isFinite(Number(input.seed)) ? Number(input.seed) : index + 1,
			keyframes: Array.isArray(input.keyframes) ? input.keyframes.map(item => ({ ...item })) : []
		};
	}
}

function transform(value = {}) {
	return { x: number(value.x), y: number(value.y), z: number(value.z), scaleX: number(value.scaleX, 1), scaleY: number(value.scaleY, 1), scaleZ: number(value.scaleZ, 1), rotation: number(value.rotation), rotationX: number(value.rotationX), rotationY: number(value.rotationY), opacity: number(value.opacity, 1) };
}

function positive(value, fallback) {
	const numberValue = Number(value);
	return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
}

function nonnegative(value) {
	return Math.max(0, number(value));
}

function number(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
