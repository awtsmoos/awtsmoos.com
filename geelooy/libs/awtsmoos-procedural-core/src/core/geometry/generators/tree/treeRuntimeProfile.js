// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeRuntimeProfile.js
 * @description Owns bounded live-tree structure profiles inside the canonical procedural tree library.
 * The Awtsmoos reveals one botanical law through many finite vessels; Awtsmoos.com lets games request
 * showcase, canopy, or reference density without reaching inside branch records and becoming a second grower.
 */

import { resolveTreeConfig } from './treeConfigResolver.js';

const PROFILES = Object.freeze({
	showcase: profile('showcase', 72, 2, [4, 3, 2], [6, 4, 3], [6, 4, 3], 5, 1.08, 'balanced'),
	canopy: profile('canopy', 28, 1, [3, 2], [4, 3], [4, 3], 3, 1.18, 'low'),
	reference: profile('reference', 56, 3, [5, 4, 3, 0], [6, 5, 4, 3], [6, 5, 4, 3], 5, 1.48, 'balanced', 2)
});

export const TREE_RUNTIME_PROFILES = PROFILES;

/**
 * Applies a named live profile to a cloned canonical preset.
 * @param {string|object} input Canonical preset name or configuration.
 * @param {object|string} [options] Profile name or bounded overrides.
 * @returns {object} Mutable resolved configuration ready for canonical generation.
 */
export function applyTreeRuntimeProfile(input, options = {}) {
	const request = typeof options === 'string' ? { profile: options } : options;
	const base = treeRuntimeProfile(request.profile || request.name || 'canopy');
	const config = resolveTreeConfig(input);
	const levels = boundedLevels(config.branch?.levels, request.maxLevels, base);
	config.seed = finite(request.seed, config.seed);
	config.maxBranches = boundedInteger(request.maxBranches, base.maxBranches, 8, 512);
	config.branch = {
		...config.branch,
		levels,
		children: cappedRecord(config.branch?.children, base.children, levels, true),
		sections: cappedRecord(config.branch?.sections, base.sections, levels),
		segments: cappedRecord(config.branch?.segments, base.segments, levels)
	};
	config.leaves = {
		...config.leaves,
		billboard: base.leafBillboard || config.leaves?.billboard,
		count: boundedLeafCount(config.leaves?.count, base),
		size: Math.max(0.05, finite(config.leaves?.size, 1) * base.leafScale)
	};
	config.runtimeProfile = Object.freeze({
		detail: base.detail,
		levels,
		name: base.name,
		structuralAuthority: 'awtsmoos-procedural-core'
	});
	return config;
}

export function treeRuntimeProfile(name = 'canopy') {
	const value = PROFILES[name];
	if (!value) throw new Error(`B"H | Unknown tree runtime profile: ${name}`);
	return value;
}

export function listTreeRuntimeProfiles() {
	return Object.values(PROFILES).map(value => ({ ...value }));
}

function profile(name, maxBranches, maxLevels, children, sections, segments, leafCount, leafScale, detail, minLeaves = 0) {
	return Object.freeze({
		children: Object.freeze(children),
		detail,
		leafBillboard: name === 'reference' ? 'single' : null,
		leafCount,
		leafScale,
		maxBranches,
		maxLevels,
		minLeaves,
		name,
		sections: Object.freeze(sections),
		segments: Object.freeze(segments)
	});
}

function cappedRecord(source = {}, caps, levels, stopAtFinal = false) {
	const output = {};
	for (let level = 0; level <= levels; level += 1) {
		const original = finite(source[level] ?? source[String(level)], caps[level] ?? caps.at(-1));
		output[level] = stopAtFinal && level === levels
			? 0
			: Math.max(1, Math.min(Math.floor(original), caps[level] ?? caps.at(-1)));
	}
	return output;
}

function boundedLevels(value, requested, profileValue) {
	const maximum = boundedInteger(requested, profileValue.maxLevels, 1, profileValue.maxLevels);
	return Math.max(1, Math.min(Math.floor(finite(value, maximum)), maximum));
}

function boundedLeafCount(value, profileValue) {
	const original = Math.floor(finite(value, profileValue.leafCount));
	return Math.max(profileValue.minLeaves, Math.min(original, profileValue.leafCount));
}

function boundedInteger(value, fallback, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Math.floor(finite(value, fallback))));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : Number(fallback);
}
