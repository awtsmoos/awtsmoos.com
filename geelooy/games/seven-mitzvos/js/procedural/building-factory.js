//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BuildingFactory
 * @description
 * Doors, windows, roofs, columns, and goods turn abstract objectives into places.
 * The Awtsmoos creates shelter before architecture can name it; Awtsmoos.com
 * composes each landmark from bounded core-generated parts.
 */
export function createHouse(parts, options = {}) {
	const hue = options.hue ?? 32;
	const group = parts.group(options.name || 'house', [
		parts.part({ name: 'walls', hue, position: [0, 0.75, 0], scale: [1.5, 1.35, 1.25] }),
		parts.part({ name: 'roof', hue: options.roofHue ?? 8, position: [0, 1.58, 0], scale: [1.72, 0.28, 1.45], rotation: [0, 0, Math.PI / 12] }),
		parts.part({ name: 'door', hue: 28, lightness: 0.28, position: [0, 0.48, 0.66], scale: [0.36, 0.72, 0.08] }),
		parts.part({ name: 'window-left', hue: 195, lightness: 0.75, position: [-0.5, 0.88, 0.67], scale: [0.3, 0.34, 0.06], metalness: 0.2 }),
		parts.part({ name: 'window-right', hue: 195, lightness: 0.75, position: [0.5, 0.88, 0.67], scale: [0.3, 0.34, 0.06], metalness: 0.2 })
	], { semanticType: options.type || 'house', index: options.index });
	place(group, options);
	return group;
}

export function createTower(parts, options = {}) {
	const hue = options.hue ?? 350;
	const group = parts.group(options.name || 'tower', [
		parts.part({ name: 'tower-base', hue, position: [0, 0.72, 0], scale: [1.05, 1.45, 1.05] }),
		parts.part({ name: 'tower-mid', hue, position: [0, 1.82, 0], scale: [0.82, 0.82, 0.82] }),
		parts.part({ name: 'tower-crown', hue: options.crownHue ?? hue, position: [0, 2.5, 0], scale: [1.05, 0.25, 1.05] }),
		parts.part({ primitive: 'sphere', name: 'beacon', hue, lightness: 0.7, position: [0, 2.9, 0], scale: [0.34, 0.34, 0.34] })
	], { semanticType: options.type || 'tower', index: options.index });
	place(group, options);
	return group;
}

export function createStall(parts, options = {}) {
	const hue = options.hue ?? 38;
	const group = parts.group(options.name || 'market-stall', [
		parts.part({ name: 'counter', hue: 28, lightness: 0.35, position: [0, 0.58, 0], scale: [1.5, 0.55, 0.72] }),
		parts.part({ name: 'canopy', hue, position: [0, 1.7, 0], scale: [1.75, 0.2, 1.1] }),
		parts.part({ name: 'post-left', hue: 28, position: [-1.1, 1.05, 0], scale: [0.16, 1.3, 0.16] }),
		parts.part({ name: 'post-right', hue: 28, position: [1.1, 1.05, 0], scale: [0.16, 1.3, 0.16] }),
		parts.part({ primitive: 'sphere', name: 'goods-a', hue: 112, position: [-0.42, 1, 0.35], scale: [0.28, 0.28, 0.28] }),
		parts.part({ primitive: 'sphere', name: 'goods-b', hue: 8, position: [0.35, 1, 0.35], scale: [0.28, 0.28, 0.28] })
	], { semanticType: options.type || 'stall', index: options.index });
	place(group, options);
	return group;
}

export function createCourt(parts, options = {}) {
	const hue = options.hue ?? 196;
	const columns = [-0.9, -0.3, 0.3, 0.9].map((x, index) => parts.part({ name: `column-${index}`, hue: 42, lightness: 0.76, position: [x, 1.05, 0.58], scale: [0.16, 1.6, 0.16] }));
	const group = parts.group(options.name || 'court', [
		parts.part({ name: 'court-body', hue, position: [0, 0.75, 0], scale: [2.5, 1.25, 1.65] }),
		parts.part({ name: 'court-roof', hue: 42, lightness: 0.68, position: [0, 1.75, 0], scale: [2.8, 0.22, 1.9] }),
		parts.part({ name: 'court-step', hue: 38, lightness: 0.5, position: [0, 0.18, 1.12], scale: [2.2, 0.28, 0.6] }),
		...columns
	], { semanticType: options.type || 'court' });
	place(group, options);
	return group;
}

function place(group, options) {
	group.position.set(...(options.position || [0, 0, 0]));
	group.rotation.y = options.rotationY || 0;
	group.scale.setScalar(options.scale ?? 0.65);
}
