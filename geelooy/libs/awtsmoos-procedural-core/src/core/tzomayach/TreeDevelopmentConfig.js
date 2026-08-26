// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeDevelopmentConfig.js
 * @description Applies development evidence to the canonical configuration before its one shared skeleton is generated.
 * The Awtsmoos renews hidden pattern before branch length, crown spread, or wind-bent direction can appear; Awtsmoos.com lets ecological intent
 * deepen the existing EZ-tree-style vocabulary while never introducing a rival skeleton, rival LOD path, or impossible independent branch radius.
 */

import {
	createTreeDevelopmentForce,
	treeDevelopmentAngleScale,
	treeDevelopmentGnarlinessScale
} from './TreeDevelopmentForcing.js';

/** Applies bounded developmental scaling and directional forcing to the canonical tree configuration. */
export function applyTreeDevelopmentConfig(config, development) {
	if (!development) return config;
	config.branch = {
		...config.branch,
		angle: scaleLevelValues(
			config.branch?.angle,
			level => level === 0 ? 1 : treeDevelopmentAngleScale(development)
		),
		children: scaleLevelValues(
			config.branch?.children,
			level => level === 0 ? 1 : crownDensity(development),
			true
		),
		force: createTreeDevelopmentForce(config.branch, development),
		gnarliness: scaleLevelValues(
			config.branch?.gnarliness,
			() => treeDevelopmentGnarlinessScale(development)
		),
		length: scaleLevelValues(
			config.branch?.length,
			level => level === 0 ? development.heightScale : development.crownScale
		),
		radius: scaleLevelValues(
			config.branch?.radius,
			level => level === 0 ? development.trunkScale : 0.84 + development.vigor * 0.16
		)
	};
	config.leaves = {
		...config.leaves,
		count: scaledLeafCount(config.leaves?.count, development),
		size: Number(config.leaves?.size ?? 2) * (0.84 + development.age * 0.16)
	};
	config.development = development;
	return config;
}

function scaleLevelValues(values, scaleAtLevel, integer = false) {
	if (values == null) return values;
	if (typeof values === 'number') {
		return scaleValue(values, scaleAtLevel(0), integer);
	}
	return Object.fromEntries(
		Object.entries(values).map(([level, value]) => {
			return [level, scaleValue(value, scaleAtLevel(Number(level)), integer)];
		})
	);
}

function scaleValue(value, scale, integer) {
	const result = Number(value) * Number(scale);
	if (!integer) return result;
	if (Number(value) <= 0) return 0;
	return Math.max(1, Math.round(result));
}

function crownDensity(development) {
	return clamp(
		0.56
		+ development.crownMaturity * 0.52
		- development.branchMortality * 0.18
		- development.spaceCompetition * 0.12,
		0.3,
		1.12
	);
}

function scaledLeafCount(count, development) {
	const numericCount = Math.max(0, Number(count) || 0);
	if (!numericCount) return 0;
	const density = clamp(
		0.35
		+ development.foliageMaturity * 0.75
		- development.branchMortality * 0.12
		- development.spaceCompetition * 0.08,
		0.18,
		1.08
	);
	return Math.max(1, Math.round(numericCount * density));
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
