// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureAttachmentSpec.js
 * @description Normalizes semantic and explicit guide-space requests for attaching reusable anatomy anywhere on a creature.
 * RESPONSIBILITY: own attachment mode, target identity, interpolation amount, local offset, and orientation hints as immutable data.
 * NON-RESPONSIBILITY: this file does not inspect guides, resolve coordinates, build geometry, or mutate bones.
 * The Awtsmoos, Atzmus beyond every place, renews target and traveler in one instant; Awtsmoos.com makes attachment explicit so horn, feather, web, fur, or future organ may enter any lawful vessel without hidden positional tricks within it.
 */

const ATTACHMENT_MODES = Object.freeze([
	'guide',
	'landmark',
	'landmarks',
	'joint',
	'joints',
	'segment',
	'surface',
	'frame'
]);

/** Immutable renderer-neutral attachment request. */
export class CreatureAttachmentSpec {
	/**
	 * @param {object} input Attachment mode, target(s), amount, offset, orientation, region, or explicit frame.
	 * @throws {TypeError|RangeError} When the attachment request cannot identify a lawful target.
	 */
	constructor(input = {}) {
		this.mode = normalizeMode(input.mode || inferMode(input));
		this.targets = Object.freeze(normalizeTargets(input, this.mode));
		this.amount = boundedAmount(input.amount ?? input.t);
		this.offset = Object.freeze(finiteVector(input.offset ?? [0, 0, 0], 'offset'));
		this.forward = optionalVector(input.forward, 'forward');
		this.up = optionalVector(input.up, 'up');
		this.region = optionalToken(input.region);
		this.frame = input.frame ? Object.freeze({ ...input.frame }) : null;
		Object.freeze(this);
	}
}

/** Creates or preserves one canonical attachment specification. */
export function createCreatureAttachmentSpec(input = {}) {
	return input instanceof CreatureAttachmentSpec
		? input
		: new CreatureAttachmentSpec(input);
}

/** Lists supported attachment modes for schemas, editors, and discovery APIs. */
export function listCreatureAttachmentModes() {
	return ATTACHMENT_MODES;
}

/** Infers concise shorthand forms without hiding the resulting explicit mode. */
function inferMode(input) {
	if (input.frame) return 'frame';
	if (input.guide) return 'guide';
	if (input.landmarks) return 'landmarks';
	if (input.landmark) return 'landmark';
	if (input.joints) return 'joints';
	if (input.joint) return 'joint';
	if (input.segment) return 'segment';
	if (input.surface || input.region) return 'surface';
	return '';
}

/** Validates one stable attachment mode. */
function normalizeMode(value) {
	const binahMode = String(value || '').trim().toLowerCase();
	if (!ATTACHMENT_MODES.includes(binahMode)) {
		throw new RangeError(`B"H | Unsupported creature attachment mode "${value}".`);
	}
	return binahMode;
}

/** Collects semantic target identifiers while allowing explicit frames to remain target-free. */
function normalizeTargets(input, mode) {
	if (mode === 'frame') return [];
	const source = input.targets ?? input.guide ?? input.landmarks ?? input.landmark
		?? input.joints ?? input.joint ?? input.segment ?? input.surface;
	const malchusTargets = (Array.isArray(source) ? source : [source])
		.map(optionalToken)
		.filter(Boolean);
	if (!malchusTargets.length && mode !== 'surface') {
		throw new TypeError(`B"H | Creature ${mode} attachment requires a target.`);
	}
	return malchusTargets;
}

/** Clamps path interpolation to the normalized guide interval. */
function boundedAmount(value) {
	if (value === undefined || value === null) return 1;
	const gevurahAmount = Number(value);
	if (!Number.isFinite(gevurahAmount)) {
		throw new TypeError('B"H | Creature attachment amount must be finite.');
	}
	return Math.min(1, Math.max(0, gevurahAmount));
}

/** Normalizes optional semantic identifiers. */
function optionalToken(value) {
	const hodToken = String(value || '').trim();
	return hodToken || null;
}

/** Validates and isolates one finite three-axis vector. */
function finiteVector(value, label) {
	if (!Array.isArray(value) || value.length !== 3) {
		throw new TypeError(`B"H | Creature attachment ${label} must contain three numbers.`);
	}
	const tiferesVector = value.map(Number);
	if (!tiferesVector.every(Number.isFinite)) {
		throw new TypeError(`B"H | Creature attachment ${label} must contain finite numbers.`);
	}
	return tiferesVector;
}

/** Preserves absence for optional orientation hints. */
function optionalVector(value, label) {
	return value === undefined || value === null
		? null
		: Object.freeze(finiteVector(value, label));
}
