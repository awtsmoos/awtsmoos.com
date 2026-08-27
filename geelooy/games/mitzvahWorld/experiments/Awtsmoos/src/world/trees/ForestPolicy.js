// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestPolicy.js
 * @description Adapts every procedural-core tree preset or species to measured world placement.
 * The Awtsmoos reveals many botanical forms through one generator; Awtsmoos.com changes only
 * runtime density, height, spacing, collision, and seed while core owns all tree construction.
 */

import { getTreePreset } from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';

const NEAR = Object.freeze({ branches: 72, children: [4, 3, 2], leaves: 5, levels: 2, sections: [6, 4, 3], segments: [6, 4, 3] });
const FAR = Object.freeze({ branches: 28, children: [3, 2], leaves: 3, levels: 1, sections: [4, 3], segments: [4, 3] });

export function createForestPolicy(name, index) {
	const near = index % 4 === 0;
	const caps = near ? NEAR : FAR;
	const config = getTreePreset(name);
	config.seed = Number(config.seed || 1) + index * 7919;
	config.maxBranches = caps.branches;
	config.branch.levels = Math.min(Number(config.branch.levels || 1), caps.levels);
	config.branch.children = cappedRecord(config.branch.children, caps.children);
	config.branch.sections = cappedRecord(config.branch.sections, caps.sections);
	config.branch.segments = cappedRecord(config.branch.segments, caps.segments);
	config.leaves.count = Math.min(Number(config.leaves.count || 0), caps.leaves);
	config.leaves.size = Number(config.leaves.size || 1) * (near ? 1.08 : 1.18);
	const height = presetHeight(name, near, index);
	return policy(name, index, height, near ? 'near-showcase' : 'mobile-canopy', {
		config,
		collisionRadiusRatio: /Bush|Trellis/i.test(name) ? 0.16 : 0.095
	});
}

export function createReferenceForestPolicy(species, index) {
	const height = referenceHeight(species.label, index);
	return policy(species.label, index, height, 'core-reference-species', {
		collisionRadiusRatio: referenceRadius(species.label),
		referenceSpecies: species.id
	});
}

function policy(name, index, targetHeight, tier, extra) {
	return Object.freeze({
		collisionHeightRatio: 0.34,
		index,
		name,
		spacing: Math.max(6.8, targetHeight * 0.56),
		targetHeight,
		tier,
		wind: 'static-tiny-renderer-limit',
		...extra
	});
}

function cappedRecord(record = {}, caps) {
	return Object.fromEntries(Object.entries(record).map(([key, value]) => {
		const level = Number(key);
		return [key, Math.min(Number(value) || 0, caps[level] ?? caps.at(-1))];
	}));
}

function presetHeight(name, near, index) {
	if (/Bush|Trellis/i.test(name)) return near ? 5.8 : 4.4;
	if (/Palm/i.test(name)) return near ? 15.5 : 12.5;
	if (/Redwood|Baobab|Giant|Tall/i.test(name)) return near ? 22 : 16.5;
	if (/Cypress|Poplar|Pine Large/i.test(name)) return near ? 18 : 14;
	return (near ? 13 : 9.5) + index % 3 * 0.65;
}

function referenceHeight(label, index) {
	if (/Cypress|Pine|Evergreen/i.test(label)) return 15.5 + index % 2;
	if (/Oak|Willow|Olive|Maple/i.test(label)) return 13.8 + index % 3 * 0.55;
	return 10.4 + index % 3 * 0.5;
}

function referenceRadius(label) {
	if (/Cypress|Pine|Evergreen/i.test(label)) return 0.075;
	if (/Willow|Oak|Magnolia/i.test(label)) return 0.115;
	return 0.095;
}
