// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageOrnamentLayout.js
 * @description Lays timber frames, shutters, flower boxes, blossoms, and stone steps.
 * The Awtsmoos gives the large house a human face through repeated acts of care;
 * Awtsmoos.com lets beams, petals, and thresholds proclaim inhabited scale.
 */

import { cottageWindowDescriptors, facadeBox } from './VillageCottageFacadeLayout.js';

export function appendCottageOrnamentLayout(collector, cottage) {
	appendBeams(collector.beams, cottage);
	if (cottage.detail === 'far') return;
	appendWindowOrnaments(collector, cottage);
	collector.steps.push(facadeBox(
		cottage,
		0,
		0.24,
		cottage.depth * 0.61,
		2.35,
		0.48,
		1.25
	));
}

function appendBeams(output, cottage) {
	for (let story = 1; story < cottage.stories; story += 1) {
		output.push(facadeBox(
			cottage,
			0,
			story * cottage.storyHeight,
			cottage.depth * 0.525,
			cottage.width * 0.96,
			0.18,
			0.2
		));
	}
	output.push(facadeBox(
		cottage,
		0,
		cottage.wallHeight - 0.2,
		cottage.depth * 0.525,
		cottage.width * 0.96,
		0.18,
		0.2
	));
	output.push(facadeBox(
		cottage,
		0,
		cottage.wallHeight / 2,
		cottage.depth * 0.53,
		0.19,
		cottage.wallHeight - 0.35,
		0.21
	));
}

function appendWindowOrnaments(collector, cottage) {
	for (const window of cottageWindowDescriptors(cottage)) {
		const local = worldToLocal(window.position, cottage);
		for (const side of [-1, 1]) {
			collector.shutters.push(facadeBox(
				cottage,
				local.x + side * 0.64,
				local.y,
				local.z + 0.025,
				0.24,
				1.18,
				0.1
			));
		}
		collector.flowerBoxes.push(facadeBox(cottage, local.x, local.y - 0.72, local.z + 0.08, 1.35, 0.26, 0.38));
		for (const offset of [-0.4, 0, 0.4]) {
			collector.blossoms.push(facadeBox(cottage, local.x + offset, local.y - 0.43, local.z + 0.13, 0.32, 0.38, 0.32));
		}
	}
}

function worldToLocal(position, cottage) {
	const dx = position.x - cottage.x;
	const dz = position.z - cottage.z;
	const cosine = Math.cos(cottage.yaw);
	const sine = Math.sin(cottage.yaw);
	return {
		x: dx * cosine - dz * sine,
		y: position.y - cottage.base,
		z: dx * sine + dz * cosine
	};
}
