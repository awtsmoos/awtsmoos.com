//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module WorldPropFactory
 * @description
 * Trees, runes, evidence, fire, shelter, and fountains make each commandment a
 * place rather than a symbol. Every mesh flows through the Awtsmoos core while
 * Awtsmoos.com keeps silhouettes bold and draw complexity bounded.
 */
export function createTree(parts, options = {}) {
	const group = parts.group(options.name || 'tree', [
		parts.part({ primitive: 'cylinder', name: 'trunk', hue: 28, lightness: 0.3, position: [0, 0.8, 0], scale: [0.35, 1.6, 0.35] }),
		parts.part({ primitive: 'icosphere', name: 'crown', hue: options.hue ?? 112, position: [0, 2, 0], scale: [1.15, 1.05, 1.15] })
	], { semanticType: 'tree' });
	place(group, options);
	return group;
}

export function createRune(parts, options = {}) {
	const hue = options.hue ?? 196;
	const group = parts.group(options.name || 'rune', [
		parts.part({ primitive: 'cylinder', name: 'rune-pillar', hue, position: [0, 0.65, 0], scale: [0.55, 1.3, 0.55] }),
		parts.part({ primitive: 'torus', name: 'rune-ring', hue: options.ringHue ?? 42, lightness: 0.7, position: [0, 1.45, 0], rotation: [Math.PI / 2, 0, 0], scale: [0.55, 0.55, 0.55] })
	], { semanticType: options.type || 'rune', index: options.index });
	place(group, options);
	return group;
}

export function createEvidence(parts, options = {}) {
	const group = parts.group(options.name || 'evidence', [
		parts.part({ primitive: 'icosphere', name: 'evidence-stone', hue: options.hue ?? 196, position: [0, 0.55, 0], scale: [0.7, 0.9, 0.7] }),
		parts.part({ name: 'evidence-seal', hue: 42, lightness: 0.72, position: [0, 1.15, 0.45], scale: [0.3, 0.3, 0.08] })
	], { semanticType: options.type || 'evidence', index: options.index });
	place(group, options);
	return group;
}

export function createHazard(parts, options = {}) {
	const group = parts.group(options.name || 'hazard', [
		parts.part({ primitive: 'icosphere', name: 'hazard-core', hue: options.hue ?? 8, position: [0, 0.58, 0], scale: [0.58, 0.8, 0.58] }),
		parts.part({ primitive: 'torus', name: 'hazard-ring', hue: 42, position: [0, 0.58, 0], rotation: [Math.PI / 2, 0, 0], scale: [0.7, 0.7, 0.7] })
	], { semanticType: options.type || 'hazard', phase: options.phase || 0 });
	place(group, options);
	return group;
}

export function createShelter(parts, options = {}) {
	const group = parts.group(options.name || 'shelter', [
		parts.part({ name: 'shelter-body', hue: 145, position: [0, 0.8, 0], scale: [2.1, 1.5, 1.45] }),
		parts.part({ name: 'shelter-roof', hue: 112, position: [0, 1.72, 0], scale: [2.35, 0.25, 1.7] }),
		parts.part({ name: 'shelter-door', hue: 48, lightness: 0.72, position: [0, 0.62, 0.78], scale: [0.65, 1, 0.08] }),
		parts.part({ name: 'shelter-sign-v', hue: 0, lightness: 0.95, position: [0, 1.38, 0.82], scale: [0.14, 0.62, 0.08] }),
		parts.part({ name: 'shelter-sign-h', hue: 0, lightness: 0.95, position: [0, 1.38, 0.82], scale: [0.62, 0.14, 0.08] })
	], { semanticType: options.type || 'shelter' });
	place(group, options);
	return group;
}

function place(group, options) {
	group.position.set(...(options.position || [0, 0, 0]));
	group.rotation.y = options.rotationY || 0;
	group.scale.setScalar(options.scale ?? 0.65);
}
