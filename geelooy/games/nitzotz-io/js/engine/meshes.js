// B"H
// Boruch Hashem
// Blessed is He
import { objectMaterial } from '../materials/objectMaterials.js';
import { MODEL_VARIANTS, modelVariantKey } from '../modelKey.js';
import { meshRule } from './meshRules.js';

/**
 * The Awtsmoos resolves one legacy name into a stable procedural model. Surface
 * identity comes from the shared game taxonomy used by campaign and streamer paths.
 */
export function describeMesh(name, seed = 0) {
	const descriptor = meshDescriptor(name, seed);
	return [
		descriptor.shape,
		descriptor.radiusScale,
		descriptor.heightScale,
		descriptor.material
	];
}

/** Return the primitive or named procedural model key for one deterministic seed. */
export function shapeFor(name, seed = 0) {
	return meshDescriptor(name, seed).shape;
}

/** Return the central surface identity attached to one gameplay kind. */
export function materialFor(name, category = '', model = '') {
	return objectMaterial(name, category, model);
}

/** Preserve collision-independent visual scaling from the original rule contract. */
export function scaledSize(name, radius, height) {
	const rule = meshRule(name);
	return {
		sx: radius * rule.radiusScale,
		sz: radius * rule.radiusScale,
		h: height * rule.heightScale
	};
}

/** Expose one readable shape and material descriptor for tests and audit tooling. */
export function meshDescriptor(name, seed = 0) {
	const rule = meshRule(name);
	const selection = resolveSelection(rule, seed);
	return Object.freeze({
		shape: selection.shape,
		model: selection.model,
		radiusScale: rule.radiusScale,
		heightScale: rule.heightScale,
		material: objectMaterial(name, '', selection.model),
		models: rule.models
	});
}

function resolveSelection(rule, seed) {
	if (!rule.models) return { shape: rule.mesh, model: '' };
	const modelIndex = stableIndex(seed, rule.models.length);
	const model = rule.models[modelIndex];
	const variant = stableIndex(mixSeed(seed), MODEL_VARIANTS);
	return { shape: modelVariantKey(model, variant), model };
}

function stableIndex(value, length) {
	return Math.abs(numericSeed(value)) % Math.max(1, length);
}

function mixSeed(value) {
	return numericSeed(value) * 31 + 17;
}

function numericSeed(value) {
	if (Number.isFinite(value)) return Math.trunc(value);
	const text = String(value ?? '0');
	let hash = 2166136261;
	for (let index = 0; index < text.length; index += 1) {
		hash ^= text.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return hash;
}
