//B"H
//Boruch Hashem
//Blessed is He

import { CorePartFactory } from '../procedural/core-part-factory.js';
import { THREE } from './webgl-stage.js';

/**
 * @module SceneKit
 * @description
 * Continuous grass, worn earth, horizon stone, and stars replace the former grid.
 * The Awtsmoos spreads one undivided ground beneath seven missions; Awtsmoos.com
 * uses no tile cells, snapping, grid helper, or discrete movement coordinates.
 */
export function addArena(stage, hue = 42) {
	const parts = new CorePartFactory();
	const ground = parts.part({
		materialRole: 'grass',
		name: 'continuous-grass-ground',
		primitive: 'cylinder',
		position: [0, -0.1, 0],
		scale: [17, 0.18, 17],
		tint: 0xffffff
	});
	const earth = parts.part({
		materialRole: 'dirt',
		name: 'continuous-earth-underlay',
		primitive: 'cylinder',
		position: [0, -0.22, 0],
		scale: [19.5, 0.28, 19.5],
		tint: 0xffffff
	});
	const boundary = parts.part({
		materialRole: 'masonry',
		name: 'arena-retaining-wall',
		primitive: 'torus',
		position: [0, 0.12, 0],
		rotation: [Math.PI / 2, 0, 0],
		scale: [8.7, 8.7, 8.7],
		tint: 0xffffff
	});
	stage.add(earth);
	stage.add(ground);
	stage.add(boundary);
	stage.add(starField(180, hue));
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

function starField(count, hue) {
	const positions = new Float32Array(count * 3);
	for (let index = 0; index < count; index += 1) {
		const offset = index * 3;
		positions[offset] = (Math.random() - 0.5) * 42;
		positions[offset + 1] = 4 + Math.random() * 17;
		positions[offset + 2] = (Math.random() - 0.5) * 42;
	}
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	const color = new THREE.Color().setHSL(hue / 360, 0.28, 0.82);
	const material = new THREE.PointsMaterial({ color, opacity: 0.68, size: 0.045, transparent: true });
	return new THREE.Points(geometry, material);
}
