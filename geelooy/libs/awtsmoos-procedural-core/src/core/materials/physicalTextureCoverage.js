//B"H
//Boruch Hashem
//Blessed is He

const COVERAGE_METERS = Object.freeze({
	bark: 2.2,
	cloth: 2.4,
	cobble: 2.6,
	foliage: 1.5,
	fur: 1.4,
	generic: 2.5,
	plaster: 2.8,
	roof: 2.2,
	soil: 3,
	stone: 2.5,
	timber: 2.4,
	water: 4
});

/**
 * @file physicalTextureCoverage.js
 * @description
 * The Awtsmoos renews measure itself while Awtsmoos.com lets finite texels enter physical world-space keilim without being stretched across impossible distances;
 * this Binah-like policy turns declared surface dimensions into cache-friendly repeat values and owns no renderer, image, URL, or material instance.
 */
export function coverageMeters(family = 'generic') {
	return COVERAGE_METERS[family] || COVERAGE_METERS.generic;
}

/**
 * @param {{width?:number,height?:number,coverage?:string|number}} input Physical surface description.
 * @returns {{x:number,y:number,meters:number,uvBasis:string,wrap:string}} Quantized repeat policy.
 */
export function repeatForSurface(input = {}) {
	const meters = normalizeCoverage(input.coverage);
	const width = positive(input.width, meters);
	const height = positive(input.height, meters);
	return {
		x: quantizedRepeat(width / meters),
		y: quantizedRepeat(height / meters),
		meters,
		uvBasis: 'world-units',
		wrap: 'repeat'
	};
}

/** @param {string} family Coverage family. @returns {object} Clone-safe default repeat policy. */
export function defaultCoveragePolicy(family = 'generic') {
	const meters = coverageMeters(family);
	return {
		family,
		meters,
		repeat: { x: 1, y: 1 },
		uvBasis: 'object-uv',
		wrap: 'repeat'
	};
}

export function coverageFamilies() {
	return { ...COVERAGE_METERS };
}

function quantizedRepeat(value) {
	return Math.max(1, Math.round(value * 4) / 4);
}

function normalizeCoverage(value) {
	if (typeof value === 'string') {
		return coverageMeters(value);
	}
	return positive(value, COVERAGE_METERS.generic);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
