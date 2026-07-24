//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AnimalDetailFactory
 * @description
 * Chest, belly, neck, jaw, muzzle, ears, eyes, tail, joints, hooves, and optional
 * horns make a species legible before its GLB arrives. The Awtsmoos sustains life;
 * Awtsmoos.com builds each fallback from advanced procedural-core profiles and fur.
 */
export function animalBody(parts, options = {}) {
	const species = options.species || 'deer';
	const fur = furOptions(species, options);
	const dark = { materialRole: 'leather', tint: 0x2c211b };
	const legs = [[-0.72, -0.42], [0.72, -0.42], [-0.72, 0.42], [0.72, 0.42]]
		.map((point, index) => animalLeg(parts, index, point, fur, dark));
	return [
		parts.part({ ...fur, primitive: 'icosphere', name: 'body', position: [0, 0.98, 0], scale: bodyScale(species) }),
		parts.part({ ...fur, primitive: 'icosphere', name: 'chest', position: [0.76, 1.04, 0], scale: [0.64, 0.76, 0.68] }),
		parts.part({ ...fur, primitive: 'cylinder', name: 'neck', position: [0.88, 1.42, 0], rotation: [0, 0, -0.36], scale: [0.34, 0.92, 0.34] }),
		parts.part({ ...fur, primitive: 'icosphere', name: 'head', position: [1.24, 1.62, 0], scale: [0.58, 0.52, 0.48] }),
		parts.part({ ...fur, primitive: 'icosphere', name: 'muzzle', position: [1.7, 1.48, 0], scale: [0.34, 0.26, 0.3] }),
		parts.part({ ...dark, primitive: 'icosphere', name: 'nose', position: [1.99, 1.49, 0], scale: [0.1, 0.1, 0.14] }),
		parts.part({ ...dark, primitive: 'icosphere', name: 'eye-left', position: [1.37, 1.75, -0.43], scale: [0.055, 0.072, 0.045] }),
		parts.part({ ...dark, primitive: 'icosphere', name: 'eye-right', position: [1.37, 1.75, 0.43], scale: [0.055, 0.072, 0.045] }),
		parts.part({ ...fur, name: 'ear-left', position: [1.17, 2.03, -0.32], rotation: [0.2, 0, -0.3], scale: [0.16, 0.38, 0.1] }),
		parts.part({ ...fur, name: 'ear-right', position: [1.17, 2.03, 0.32], rotation: [-0.2, 0, -0.3], scale: [0.16, 0.38, 0.1] }),
		parts.part({ ...fur, primitive: 'cylinder', name: 'tail', position: [-1.22, 1.16, 0], rotation: [0, 0, 1.15], scale: [0.12, 0.62, 0.12] }),
		...horns(parts, species),
		...legs
	];
}

export function modelAssetForSpecies(species = '') {
	if (species === 'sheep') return 'sheep';
	if (species === 'cow') return 'cow';
	return '';
}

function animalLeg(parts, index, point, fur, hoof) {
	const group = parts.group(`leg-${index}`, [
		parts.part({ ...fur, primitive: 'cylinder', name: `leg-${index}-upper`, position: [0, -0.22, 0], scale: [0.17, 0.46, 0.17] }),
		parts.part({ ...fur, primitive: 'cylinder', name: `leg-${index}-lower`, position: [0, -0.62, 0], scale: [0.13, 0.38, 0.13] }),
		parts.part({ ...hoof, name: `hoof-${index}`, position: [0.08, -0.88, 0], scale: [0.24, 0.15, 0.2] })
	]);
	group.position.set(point[0], 0.82, point[1]);
	return group;
}

function horns(parts, species) {
	if (species !== 'cow' && species !== 'deer') return [];
	const horn = { materialRole: 'stone', tint: 0xe0d2aa };
	return [-1, 1].map(side => parts.part({
		...horn,
		primitive: 'cylinder',
		name: `horn-${side}`,
		position: [1.12, 2.02, side * 0.3],
		rotation: [side * 0.36, 0, -0.54],
		scale: [0.08, 0.48, 0.08]
	}));
}

function furOptions(species, options) {
	const role = species === 'cow' ? 'cowFur' : 'deerFur';
	return { materialRole: role, tint: options.furTint ?? 0xffffff };
}

function bodyScale(species) {
	if (species === 'sheep') return [1.28, 0.82, 0.74];
	if (species === 'cow') return [1.5, 0.78, 0.78];
	return [1.38, 0.64, 0.62];
}
