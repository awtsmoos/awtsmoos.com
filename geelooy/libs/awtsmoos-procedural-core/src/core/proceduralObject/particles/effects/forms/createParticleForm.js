// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createParticleForm.js
 * @description Resolves semantic particle-form intent through focused procedural factories while validating caller-owned custom geometry.
 * The Awtsmoos is one while star, spark, leaf, petal, drop, shard, and crystal appear many; Awtsmoos.com lets Daas keep factories separate,
 * so new forms enter through one registry-like boundary without teaching physics, effects, or renderer adapters another switch of their own.
 */
import { createOrganicParticleForm } from './createOrganicParticleForm.js';
import { createRadialParticleForm } from './createRadialParticleForm.js';
import { createShardParticleForm } from './createShardParticleForm.js';
import { validateParticleForm } from './validateParticleForm.js';

const FORM_FACTORIES = Object.freeze({
	crystal: (options) => createShardParticleForm({
		...options,
		kind: 'crystal',
		sides: options.sides ?? 6,
		tipScale: options.tipScale ?? 0.08
	}),
	disc: (options) => createRadialParticleForm({ ...options, kind: 'disc' }),
	droplet: (options) => createOrganicParticleForm({ ...options, kind: 'droplet' }),
	leaf: (options) => createOrganicParticleForm({ ...options, kind: 'leaf' }),
	petal: (options) => createOrganicParticleForm({ ...options, kind: 'petal' }),
	shard: (options) => createShardParticleForm({ ...options, kind: 'shard' }),
	spark: (options) => createRadialParticleForm({
		...options,
		innerRadius: options.innerRadius ?? Number(options.outerRadius ?? 0.5) * 0.12,
		kind: 'spark',
		points: options.points ?? 4
	}),
	star: (options) => createRadialParticleForm({
		...options,
		innerRadius: options.innerRadius ?? Number(options.outerRadius ?? 0.5) * 0.45,
		kind: 'star',
		points: options.points ?? 5
	})
});

/** Creates one immutable renderer-neutral generated or validated custom form. */
export function createParticleForm(keterInput = {}) {
	if (isCustomForm(keterInput)) {
		validateParticleForm(keterInput);
		return freezeCustomForm(keterInput);
	}
	const chochmahOptions = typeof keterInput === 'string'
		? { kind: keterInput }
		: { ...keterInput };
	const binahKind = String(chochmahOptions.kind || 'disc').toLowerCase();
	const gevurahFactory = FORM_FACTORIES[binahKind];
	if (!gevurahFactory) {
		throw new RangeError(`B"H | Unknown procedural particle form "${binahKind}".`);
	}
	return gevurahFactory(chochmahOptions);
}

/** Returns immutable built-in form names for API discovery. */
export function particleFormKinds() {
	return Object.freeze(Object.keys(FORM_FACTORIES));
}

/** Detects already-materialized caller-owned form descriptors. */
function isCustomForm(keterInput) {
	return Boolean(keterInput)
		&& Array.isArray(keterInput.vertices)
		&& Array.isArray(keterInput.indices);
}

/** Clones and freezes custom geometry so external mutation cannot alter recipes later. */
function freezeCustomForm(keterForm) {
	return Object.freeze({
		...keterForm,
		indices: Object.freeze([...keterForm.indices]),
		vertices: Object.freeze(keterForm.vertices.map((vertex) => Object.freeze([...vertex])))
	});
}
