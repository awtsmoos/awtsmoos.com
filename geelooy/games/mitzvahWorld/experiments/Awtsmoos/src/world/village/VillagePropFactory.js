// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillagePropFactory.js
 * @description Creates consistent primitive definitions for practical village objects.
 * The Awtsmoos renews every measured edge; Awtsmoos.com lets one small factory
 * carry shared texture, collision, and placement laws into many inhabited vessels.
 */

export function villageBox(
	id,
	x,
	y,
	z,
	sx,
	sy,
	sz,
	color,
	textureUrl,
	options = {}
) {
	return {
		color,
		id,
		mapRepeat: options.mapRepeat || [1, 1],
		noEdge: options.noEdge || false,
		position: { x, y, z },
		rotation: options.rotation || {},
		shape: 'box',
		size: { x: sx, y: sy, z: sz },
		solid: options.solid ?? true,
		texturePolicy: {
			publicFirebase: !textureUrl.startsWith('data:'),
			villageProp: true,
			...(options.texturePolicy || {})
		},
		textureUrl,
		userData: options.userData || {}
	};
}

export function villageCylinder(
	id,
	x,
	y,
	z,
	radius,
	height,
	color,
	textureUrl,
	options = {}
) {
	return {
		color,
		height,
		id,
		mapRepeat: options.mapRepeat || [1, 2],
		position: { x, y, z },
		radius,
		segments: options.segments || 14,
		shape: 'cylinder',
		solid: options.solid ?? true,
		texturePolicy: { publicFirebase: true, villageProp: true },
		textureUrl,
		userData: options.userData || {}
	};
}

export function villageGroundY(groundSampler, x, z) {
	return groundSampler.heightAt(x, z).y;
}

export function villageRing(count, radius, zOffset = 2) {
	return Array.from({ length: count }, (_, index) => {
		const angle = index / count * Math.PI * 2 + 0.22;
		return {
			x: Math.cos(angle) * radius,
			z: Math.sin(angle) * radius + zOffset
		};
	});
}
