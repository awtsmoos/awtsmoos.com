// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureComponentAction.js
 * @description Defines WHAT a reusable component intends to do after attachment resolution has answered WHERE it belongs.
 * RESPONSIBILITY: normalize attach, replace, blend, wrap, embed, span, scatter, array, mirror, growth, conform, extrusion, and inset semantics as immutable renderer-neutral data.
 * NON-RESPONSIBILITY: this contract does not resolve frames, cut topology, weld surfaces, instantiate meshes, or mutate renderer objects.
 * The Awtsmoos renews deed and destination without confusing either vessel; Awtsmoos.com lets one organ attach, replace, blend, or grow by law while every renderer remains free to reveal that intention in its own garment.
 */

const COMPONENT_ACTION_MODES = Object.freeze([
	'attach',
	'replace',
	'blend',
	'wrap',
	'embed',
	'span',
	'scatter',
	'array',
	'mirror',
	'grow_along',
	'conform_to',
	'extrude_from',
	'inset_into'
]);

/** Immutable semantic operation applied after anatomical placement is resolved. */
export class CreatureComponentAction {
	/**
	 * @param {object|string} [input='attach'] Action mode plus replacement, blending, inheritance, conformation, growth, distribution, embedding, and LOD intent.
	 */
	constructor(input = 'attach') {
		const source = typeof input === 'string' ? { mode: input } : (input || {});
		this.mode = normalizeMode(source.mode || source.action || 'attach');
		this.replaceRegion = optionalToken(source.replaceRegion);
		this.blendInto = optionalToken(source.blendInto);
		this.inheritMaterial = Boolean(source.inheritMaterial);
		this.inheritMotion = Boolean(source.inheritMotion);
		this.surfaceConform = Boolean(source.surfaceConform ?? source.conform);
		this.surfaceProjection = record(source.surfaceProjection);
		this.attachmentDepth = finiteNumber(source.attachmentDepth, 0);
		this.embedding = record(source.embedding);
		this.distribution = record(source.distribution);
		this.growthDirection = optionalVector(source.growthDirection);
		this.lod = record(source.LOD ?? source.lod);
		Object.freeze(this);
	}
}

/** Creates or preserves one canonical component action. */
export function createCreatureComponentAction(input = 'attach') {
	return input instanceof CreatureComponentAction
		? input
		: new CreatureComponentAction(input);
}

/** Lists stable semantic action modes for schemas, editors, and composition tools. */
export function listCreatureComponentActionModes() {
	return COMPONENT_ACTION_MODES;
}

/** Validates one stable action token. */
function normalizeMode(value) {
	const binahMode = String(value || '').trim().toLowerCase().replaceAll('-', '_');
	if (!COMPONENT_ACTION_MODES.includes(binahMode)) {
		throw new RangeError(`B"H | Unsupported creature component action "${value}".`);
	}
	return binahMode;
}

/** Preserves one optional semantic identifier. */
function optionalToken(value) {
	const hodToken = String(value || '').trim();
	return hodToken || null;
}

/** Freezes one ordinary intent record without evaluating its renderer meaning. */
function record(value) {
	return Object.freeze(value && typeof value === 'object' ? { ...value } : {});
}

/** Preserves one optional finite three-axis direction. */
function optionalVector(value) {
	if (value === undefined || value === null) return null;
	if (!Array.isArray(value) || value.length !== 3) {
		throw new TypeError('B"H | Component growth direction must contain three numbers.');
	}
	const tiferesVector = value.map(Number);
	if (!tiferesVector.every(Number.isFinite)) {
		throw new TypeError('B"H | Component growth direction must contain finite numbers.');
	}
	return Object.freeze(tiferesVector);
}

/** Normalizes one optional finite scalar without hiding zero. */
function finiteNumber(value, fallback) {
	const malchusValue = Number(value);
	return value !== undefined && value !== null && Number.isFinite(malchusValue)
		? malchusValue
		: fallback;
}
