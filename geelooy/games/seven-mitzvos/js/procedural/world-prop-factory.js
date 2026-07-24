//B"H
//Boruch Hashem
//Blessed is He

import { runeParts, shelterParts, treeParts } from './world-prop-detail-factory.js';

/**
 * @module WorldPropFactory
 * @description
 * Advanced trees, carved runes, evidence, hazards, and framed shelters make each
 * commandment a material place. Every fallback flows through the Awtsmoos core;
 * Awtsmoos.com hydrates selected roots with cached real GLBs after first paint.
 */
export function createTree(parts, options = {}) {
	return finish(parts.group(options.name || 'tree', treeParts(parts, options), {
		modelAsset: options.modelAsset || 'tree',
		reason: options.reason || 'marks living public space that changes with good action',
		role: options.role || 'tree',
		semanticType: 'tree'
	}), options);
}

export function createRune(parts, options = {}) {
	return finish(parts.group(options.name || 'rune', runeParts(parts, options), metadata(
		options.type || 'rune',
		options,
		'holds one ordered sound and light in the creation lesson'
	)), options);
}

export function createEvidence(parts, options = {}) {
	const stone = { materialRole: 'stone', tint: 0xffffff };
	const seal = parts.part({ materialRole: 'metal', tint: 0xffffff, name: 'evidence-seal', position: [0, 1.12, 0.48], scale: [0.3, 0.3, 0.07] });
	seal.userData.preserveWithAdvanced = true;
	const group = parts.group(options.name || 'evidence', [
		parts.part({ ...stone, primitive: 'icosphere', name: 'evidence-stone', position: [0, 0.58, 0], scale: [0.72, 0.92, 0.72] }),
		seal
	], {
		...metadata(options.type || 'evidence', options, 'carries a fact whose relevance must be examined before judgment'),
		modelAsset: options.modelAsset || 'rock'
	});
	return finish(group, options);
}

export function createHazard(parts, options = {}) {
	const group = parts.group(options.name || 'hazard', [
		parts.part({ materialRole: 'stone', tint: 0xffffff, primitive: 'icosphere', name: 'hazard-core', position: [0, 0.58, 0], scale: [0.62, 0.82, 0.62] }),
		parts.part({ materialRole: 'metal', tint: 0xffffff, primitive: 'torus', name: 'hazard-ring', position: [0, 0.58, 0], rotation: [Math.PI / 2, 0, 0], scale: [0.74, 0.74, 0.74] }),
		...[-1, 1].map(side => parts.part({ materialRole: 'metal', tint: 0xffffff, name: `hazard-spike-${side}`, position: [side * 0.88, 0.58, 0], rotation: [0, 0, Math.PI / 4], scale: [0.36, 0.1, 0.1] }))
	], metadata(options.type || 'hazard', options, 'creates a readable moving obstacle on the rescue route'));
	group.userData.phase = options.phase || 0;
	return finish(group, options);
}

export function createShelter(parts, options = {}) {
	return finish(parts.group(options.name || 'shelter', shelterParts(parts), metadata(
		options.type || 'shelter',
		options,
		'receives rescued people and supplies at the end of a safe route'
	)), options);
}

function metadata(type, options, fallbackReason) {
	return {
		index: options.index,
		reason: options.reason || fallbackReason,
		role: options.role || type,
		semanticType: type
	};
}

function finish(group, options) {
	group.position.set(...(options.position || [0, 0, 0]));
	group.rotation.y = options.rotationY || 0;
	group.scale.setScalar(options.scale ?? 0.65);
	group.userData.detailLayers = group.children.length;
	return group;
}
