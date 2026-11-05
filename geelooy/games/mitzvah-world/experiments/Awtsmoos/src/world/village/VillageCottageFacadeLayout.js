// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageFacadeLayout.js
 * @description Maps doors, windows, chimneys, and local facade coordinates across stories.
 * The Awtsmoos reveals many rooms through ordered panes of light; Awtsmoos.com keeps
 * every opening aligned to the same large cottage proportions and rotation.
 */

export function cottageWindowDescriptors(cottage) {
	if (cottage.detail === 'far') {
		return [facadeBox(cottage, -cottage.width * 0.23, 1.9, cottage.depth * 0.51, 0.92, 1.08, 0.08)];
	}
	const windows = [];
	for (let story = 0; story < cottage.stories; story += 1) {
		const height = 1.9 + story * cottage.storyHeight;
		for (const side of [-1, 1]) {
			windows.push(facadeBox(
				cottage,
				side * cottage.width * 0.23,
				height,
				cottage.depth * 0.51,
				0.92,
				1.08,
				0.08
			));
		}
	}
	return windows;
}

export function cottageDoorDescriptor(cottage) {
	return facadeBox(cottage, 0, 1.25, cottage.depth * 0.515, 1.35, 2.5, 0.12);
}

export function cottageChimneyDescriptor(cottage) {
	return facadeBox(
		cottage,
		cottage.width * 0.28,
		cottage.wallHeight + cottage.roofRise * 0.48,
		-cottage.depth * 0.15,
		0.78,
		cottage.roofRise + 1.1,
		0.78
	);
}

export function facadeBox(cottage, localX, localY, localZ, x, y, z) {
	const cosine = Math.cos(cottage.yaw);
	const sine = Math.sin(cottage.yaw);
	return {
		position: {
			x: cottage.x + localX * cosine + localZ * sine,
			y: cottage.base + localY,
			z: cottage.z - localX * sine + localZ * cosine
		},
		size: { x, y, z },
		yaw: cottage.yaw
	};
}
