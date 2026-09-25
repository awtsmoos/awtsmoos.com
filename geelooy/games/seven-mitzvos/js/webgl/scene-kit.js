//B"H
//Boruch Hashem
//Blessed is He

import { CorePartFactory } from '../procedural/core-part-factory.js';
import { createNativeStarField } from './native-star-field.js';

const DEFAULT_ARENA = Object.freeze({
	groundScale: 17,
	earthScale: 19.5,
	boundaryScale: 8.7,
	starCount: 180,
	starSpread: 42
});

/**
 * @module SceneKit
 * @description
 * Continuous grass, worn earth, horizon stone, and native stars replace the former grid.
 * The Awtsmoos spreads one undivided ground beneath many missions; Awtsmoos.com
 * preserves every historic arena size while allowing one world to request a larger vessel explicitly.
 */
export function addArena(stage, hue = 42, configuration = {}) {
	const settings = { ...DEFAULT_ARENA, ...configuration };
	const parts = new CorePartFactory();
	const ground = parts.part({
		materialRole: 'grass',
		name: 'continuous-grass-ground',
		primitive: 'cylinder',
		position: [0, -0.1, 0],
		scale: [settings.groundScale, 0.18, settings.groundScale],
		tint: 0xffffff
	});
	const earth = parts.part({
		materialRole: 'dirt',
		name: 'continuous-earth-underlay',
		primitive: 'cylinder',
		position: [0, -0.22, 0],
		scale: [settings.earthScale, 0.28, settings.earthScale],
		tint: 0xffffff
	});
	const boundary = parts.part({
		materialRole: 'masonry',
		name: 'arena-retaining-wall',
		primitive: 'torus',
		position: [0, 0.12, 0],
		rotation: [Math.PI / 2, 0, 0],
		scale: [settings.boundaryScale, settings.boundaryScale, settings.boundaryScale],
		tint: 0xffffff
	});
	stage.add(earth);
	stage.add(ground);
	stage.add(boundary);
	stage.add(createNativeStarField(settings.starCount, hue, settings.starSpread));
	return ground;
}

export function ringPosition(index, count, radius = 4.2, height = 0.6) {
	const angle = index / count * Math.PI * 2 - Math.PI / 2;
	return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
}

export function randomArenaPoint(radius = 5) {
	const angle = Math.random() * Math.PI * 2;
	const distance = Math.sqrt(Math.random()) * radius;
	return [Math.cos(angle) * distance, 0.5, Math.sin(angle) * distance];
}

export function pulseObject(object, elapsed, amount = 0.08, speed = 4) {
	const scale = 1 + Math.sin(elapsed * speed + (object.userData.phase || 0)) * amount;
	object.scale.setScalar(scale);
}
