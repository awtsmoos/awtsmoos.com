//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AnimalFactory
 * @description
 * Four legs, a listening head, ears, and a moving tail make care visible before
 * words explain it. The Awtsmoos sustains each creature; Awtsmoos.com keeps the
 * procedural body light enough for a living sanctuary on modest phones.
 */
export function createAnimal(parts, options = {}) {
	const hue = options.hue ?? 32;
	const bodyScale = options.species === 'sheep' ? [1.25, 0.78, 0.72] : [1.35, 0.62, 0.62];
	const legHue = options.legHue ?? hue;
	const legs = [[-0.72, -0.46], [0.72, -0.46], [-0.72, 0.46], [0.72, 0.46]].map((point, index) => {
		return parts.part({ name: `leg-${index}`, hue: legHue, position: [point[0], 0.35, point[1]], scale: [0.18, 0.65, 0.18] });
	});
	const group = parts.group(options.name || 'animal', [
		parts.part({ primitive: 'sphere', name: 'body', hue, position: [0, 0.9, 0], scale: bodyScale }),
		parts.part({ primitive: 'sphere', name: 'head', hue, position: [1.1, 1.12, 0], scale: [0.62, 0.56, 0.52] }),
		parts.part({ name: 'ear-left', hue, position: [1.15, 1.55, -0.32], scale: [0.16, 0.35, 0.12], rotation: [0.15, 0, -0.35] }),
		parts.part({ name: 'ear-right', hue, position: [1.15, 1.55, 0.32], scale: [0.16, 0.35, 0.12], rotation: [-0.15, 0, -0.35] }),
		parts.part({ name: 'tail', hue, position: [-1.15, 1.02, 0], scale: [0.48, 0.12, 0.12], rotation: [0, 0, 0.45] }),
		...legs
	], { semanticType: options.type || 'animal', index: options.index, need: options.need });
	group.position.set(...(options.position || [0, 0, 0]));
	group.scale.setScalar(options.scale ?? 0.58);
	group.userData.baseY = group.position.y;
	group.userData.phase = options.phase || 0;
	return group;
}

export function animateAnimal(animal, elapsed, state = 'calm') {
	const phase = elapsed * (state === 'fear' ? 7 : 3) + animal.userData.phase;
	animal.position.y = animal.userData.baseY + Math.sin(phase) * (state === 'injured' ? 0.018 : 0.035);
	const head = animal.getObjectByName('head');
	const tail = animal.getObjectByName('tail');
	if (head) head.rotation.z = state === 'injured' ? -0.22 : Math.sin(phase * 0.55) * 0.08;
	if (tail) tail.rotation.y = Math.sin(phase * 1.4) * (state === 'fear' ? 0.55 : 0.24);
}
