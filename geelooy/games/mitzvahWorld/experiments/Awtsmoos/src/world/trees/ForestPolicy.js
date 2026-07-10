// B"H
/**
 * @file ForestPolicy.js
 * @description
 * The forest does not mutilate canonical presets. It receives cloned vessels
 * and narrows recursion, radial detail, and leaf density according to a mobile
 * covenant, while every species keeps its own proportions, force, and color.
 */
import { getTreePreset } from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';

const NEAR_CAPS = Object.freeze({
	children: [6, 4, 3, 2],
	sections: [8, 6, 4, 3],
	segments: [8, 6, 4, 3],
	leaves: 9,
	branches: 160,
	levels: 3
});
const FAR_CAPS = Object.freeze({
	children: [5, 3, 2],
	sections: [6, 4, 3],
	segments: [6, 4, 3],
	leaves: 5,
	branches: 72,
	levels: 2
});

function cappedRecord(record = {}, caps) {
	const result = {};
	for (const [key, value] of Object.entries(record)) {
		const level = Number(key);
		result[key] = Math.min(Number(value) || 0, caps[level] ?? caps.at(-1));
	}
	return result;
}

function targetHeight(name, near, index) {
	if (/Bush|Trellis/i.test(name)) return near ? 5.8 : 4.4;
	if (/Palm/i.test(name)) return near ? 15.5 : 12.5;
	if (/Redwood|Baobab|Giant|Tall/i.test(name)) return near ? 22 : 16.5;
	if (/Cypress|Poplar|Pine Large/i.test(name)) return near ? 18 : 14;
	return (near ? 13 : 9.5) + (index % 3) * .65;
}

export function createForestPolicy(name, index) {
	const near = index % 4 === 0;
	const caps = near ? NEAR_CAPS : FAR_CAPS;
	const config = getTreePreset(name);
	config.seed = Number(config.seed || 1) + index * 7919;
	config.maxBranches = caps.branches;
	config.branch.levels = Math.min(Number(config.branch.levels || 1), caps.levels);
	config.branch.children = cappedRecord(config.branch.children, caps.children);
	config.branch.sections = cappedRecord(config.branch.sections, caps.sections);
	config.branch.segments = cappedRecord(config.branch.segments, caps.segments);
	config.leaves.count = Math.min(Number(config.leaves.count || 0), caps.leaves);
	const height = targetHeight(name, near, index);
	return {
		name,
		tier: near ? 'near-showcase' : 'mobile-canopy',
		config,
		targetHeight: height,
		spacing: Math.max(7.5, height * .62),
		collisionHeightRatio: .34,
		collisionRadiusRatio: /Bush|Trellis/i.test(name) ? .16 : .095,
		wind: 'static-tiny-renderer-limit',
		index
	};
}

export default createForestPolicy;
