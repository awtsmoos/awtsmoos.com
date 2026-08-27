// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeDevelopmentConfig.js
 * @description Applies development evidence to the canonical tree configuration before its single skeleton is generated.
 * The Awtsmoos, Atzmus beyond scale and maturity, renews the hidden pattern before branch length can rise or crown can spread;
 * Awtsmoos.com lets succession shape existing EZ-tree-style parameters while never introducing a rival structural algorithm instead.
 */

/**
 * Applies bounded developmental scaling to canonical branch and leaf configuration.
 * @param {object} config Fully resolved canonical tree configuration.
 * @param {object|null} development Optional tree-development profile.
 * @returns {object} Mutated resolved configuration ready for the canonical TreeGenerator.
 */
export function applyTreeDevelopmentConfig(config, development) {
	if (!development) return config;
	config.branch = {
		...config.branch,
		children: scaleLevelValues(
			config.branch?.children,
			level => level === 0 ? 1 : crownDensity(development),
			true
		),
		length: scaleLevelValues(
			config.branch?.length,
			level => level === 0
				? development.heightScale
				: development.crownScale
		),
		radius: scaleLevelValues(
			config.branch?.radius,
			level => level === 0
				? development.trunkScale
				: 0.84 + development.vigor * 0.16
		)
	};
	config.leaves = {
		...config.leaves,
		count: scaledLeafCount(config.leaves?.count, development),
		size: Number(config.leaves?.size ?? 2) * (0.84 + development.age * 0.16)
	};
	return config;
}

function scaleLevelValues(values, scaleAtLevel, integer = false) {
	if (values == null) return values;
	if (typeof values === 'number') {
		return scaleValue(values, scaleAtLevel(0), integer);
	}
	return Object.fromEntries(
		Object.entries(values).map(([level, value]) => {
			const scaled = scaleValue(value, scaleAtLevel(Number(level)), integer);
			return [level, scaled];
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
		- development.branchMortality * 0.18,
		0.34,
		1.12
	);
}

function scaledLeafCount(count, development) {
	const numericCount = Math.max(0, Number(count) || 0);
	if (!numericCount) return 0;
	const density = clamp(
		0.35 + development.foliageMaturity * 0.75 - development.branchMortality * 0.12,
		0.22,
		1.08
	);
	return Math.max(1, Math.round(numericCount * density));
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
