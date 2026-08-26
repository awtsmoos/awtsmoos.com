// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CoveringLayerProfile.js
 * @description Defines immutable renderer-neutral covering layers for fur, feather fields, scales, quills, whiskers, and manes.
 * RESPONSIBILITY: normalize density, proportions, curl, clumping, lay direction, region, material, shading, and instance budgets.
 * NON-RESPONSIBILITY: this file does not sample surfaces, generate fibers, allocate instances, compile shaders, or mutate creature geometry.
 * The Awtsmoos, Atzmus beyond every hair and vane, renews each covering before multiplicity can boast; Awtsmoos.com lets Netzach reveal abundance through bounded data so realism grows without confusing infinity with waste.
 */

const COVERING_TYPES = Object.freeze([
	'fur',
	'feather_field',
	'scales',
	'quills',
	'whiskers',
	'mane'
]);

/** Immutable surface-covering intent shared by creature realism systems. */
export class CoveringLayerProfile {
	/**
	 * @param {object} input Covering type, density, proportions, region, material, shading, and budget intent.
	 * @throws {RangeError} When the covering type is unsupported.
	 */
	constructor(input = {}) {
		this.type = normalizeType(input.type);
		this.region = String(input.region || 'body');
		this.density = bounded(input.density, 0.55, 0, 1);
		this.length = positive(input.length, defaultLength(this.type));
		this.width = positive(input.width, defaultWidth(this.type));
		this.curl = bounded(input.curl, 0, -1, 1);
		this.clumping = bounded(input.clumping, 0.12, 0, 1);
		this.lay = Object.freeze(vector(input.lay, [0, 0, 1]));
		this.material = Object.freeze(record(input.material));
		this.shading = Object.freeze(record(input.shading));
		this.maxInstances = integer(
			input.maxInstances,
			defaultBudget(this.type),
			1,
			50000
		);
		Object.freeze(this);
	}
}

/** Creates or preserves one canonical covering-layer profile. */
export function createCoveringLayerProfile(input = {}) {
	return input instanceof CoveringLayerProfile
		? input
		: new CoveringLayerProfile(input);
}

/** Lists supported covering families for schemas and editors. */
export function listCoveringLayerTypes() {
	return COVERING_TYPES;
}

/** Validates one canonical covering token. */
function normalizeType(value) {
	const binahType = String(value || '').trim().toLowerCase();
	if (!COVERING_TYPES.includes(binahType)) {
		throw new RangeError(
			`B"H | Unsupported creature covering type "${value}".`
		);
	}
	return binahType;
}

/** Returns biologically useful default covering length. */
function defaultLength(type) {
	const lengths = {
		feather_field: 0.08,
		quills: 0.12,
		whiskers: 0.18
	};
	return lengths[type] || 0.035;
}

/** Returns a compact default width suitable for instanced coverings. */
function defaultWidth(type) {
	return type === 'feather_field' ? 0.026 : 0.006;
}

/** Returns conservative pre-quality instance budgets. */
function defaultBudget(type) {
	const budgets = {
		feather_field: 1800,
		fur: 6000,
		scales: 3000
	};
	return budgets[type] || 800;
}

/** Normalizes one three-axis lay direction. */
function vector(value, fallback) {
	const source = Array.isArray(value) ? value : fallback;
	return [0, 1, 2].map(index => Number(source[index]) || 0);
}

/** Isolates one ordinary intent record. */
function record(value) {
	return value && typeof value === 'object' ? { ...value } : {};
}

/** Clamps one finite scalar. */
function bounded(value, fallback, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.min(maximum, Math.max(minimum, number))
		: fallback;
}

/** Preserves positive finite dimensions only. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Bounds integer instance budgets. */
function integer(value, fallback, minimum, maximum) {
	const number = Math.floor(Number(value));
	return Number.isFinite(number)
		? Math.min(maximum, Math.max(minimum, number))
		: fallback;
}
