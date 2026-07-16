// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file referenceTreeRuntimeProfile.js
 * @description Reduces live canopy density while preserving species proportion and material identity.
 * The Awtsmoos is not measured by polygon count; Awtsmoos.com keeps trunk, crown, blossom,
 * bark, leaf, seed, and silhouette truth while finite gameplay receives a bounded growth vessel.
 */

const CHILD_CAPS = Object.freeze([5, 4, 3, 0]);
const SECTION_CAPS = Object.freeze([6, 5, 4, 3]);
const SEGMENT_CAPS = Object.freeze([6, 5, 4, 3]);

export function applyReferenceTreeRuntimeProfile(preset, options = {}) {
	const profile = clone(preset);
	const branch = profile.branch || {};
	const originalLevels = finite(branch.levels, 3);
	const levels = Math.max(2, Math.min(3, Math.floor(originalLevels)));
	profile.maxBranches = Math.max(24, Math.min(64, finite(options.maxBranches, 56)));
	profile.branch = {
		...branch,
		levels,
		children: boundedMap(branch.children, CHILD_CAPS, levels),
		sections: boundedMap(branch.sections, SECTION_CAPS, levels),
		segments: boundedMap(branch.segments, SEGMENT_CAPS, levels)
	};
	const leaves = profile.leaves || {};
	profile.leaves = {
		...leaves,
		billboard: 'single',
		count: Math.max(2, Math.min(5, Math.floor(finite(leaves.count, 3)))),
		size: Math.max(0.35, finite(leaves.size, 1) * 1.48),
		sizeVariance: Math.min(0.42, Math.max(0.18, finite(leaves.sizeVariance, 0.3)))
	};
	profile.runtimeProfile = Object.freeze({
		branchLimit: profile.maxBranches,
		leafBillboard: profile.leaves.billboard,
		levels,
		name: 'reference-tree-live-canopy-v1'
	});
	return profile;
}

function boundedMap(source = {}, caps, levels) {
	const result = {};
	for (let level = 0; level <= levels; level += 1) {
		const original = finite(source[level] ?? source[String(level)], caps[level] ?? 3);
		const cap = caps[level] ?? caps.at(-1);
		result[level] = Math.max(level === levels ? 0 : 1, Math.min(cap, Math.floor(original)));
	}
	return result;
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clone(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}
