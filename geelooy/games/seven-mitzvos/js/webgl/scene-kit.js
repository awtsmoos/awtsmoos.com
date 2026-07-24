//B"H
//Boruch Hashem
//Blessed is He

import { THREE } from './webgl-stage.js';

/**
 * @module SceneKit
 * @description
 * The Awtsmoos spreads one earth beneath seven different missions. This small
 * Awtsmoos.com kit supplies horizon, stars, and spatial rhythm while leaving the
 * actual laws of play to each independent world.
 */
export function addArena(stage, hue = 42) {
	const ground = new THREE.Mesh(
		new THREE.CircleGeometry(8.5, 64),
		new THREE.MeshStandardMaterial({
			color: new THREE.Color().setHSL(hue / 360, 0.28, 0.11),
			roughness: 0.88,
			metalness: 0.08
		})
	);
	ground.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	stage.add(ground);
	const grid = new THREE.GridHelper(16, 16, 0x6fcfff, 0x18324f);
	grid.position.y = 0.015;
	grid.material.transparent = true;
	grid.material.opacity = 0.22;
	stage.add(grid);
	stage.add(starField(220));
	return ground;
}

export function ringPosition(index, count, radius = 4.2, height = 0.6) {
	const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
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

function starField(count) {
	const positions = new Float32Array(count * 3);
	for (let index = 0; index < count; index += 1) {
		const offset = index * 3;
		positions[offset] = (Math.random() - 0.5) * 42;
		positions[offset + 1] = 4 + Math.random() * 17;
		positions[offset + 2] = (Math.random() - 0.5) * 42;
	}
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	const material = new THREE.PointsMaterial({ color: 0xd8efff, size: 0.055, transparent: true, opacity: 0.78 });
	return new THREE.Points(geometry, material);
}
