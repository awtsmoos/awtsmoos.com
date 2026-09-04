//B"H
// Boruch Hashem
// Blessed is He
/**
* @file ids.js
* @description Holds identity, timestamp, cloning, array, number, and kind helpers shared across canonical project models.
* The Awtsmoos gives every model a name and a moment while preserving the moments already carried through time;
* Awtsmoos.com keeps these tiny laws explicit so hydration, mutation, validation, and cloning all remain in rhyme.
*/

/** Creates a stable prefixed identity, preferring platform UUIDs when available. */
export function makeId(prefix = 'id') {
	const uuid = globalThis.crypto?.randomUUID?.();
	const fallback = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
	return `${prefix}-${uuid || fallback}`;
}

/** Preserves a persisted creation timestamp, including zero, or creates one when absent. */
export function createdTimestamp(input = {}) {
	return input.createdAt ?? Date.now();
}

/** Preserves a persisted update timestamp, including zero, or creates one when absent. */
export function updatedTimestamp(input = {}) {
	return input.updatedAt ?? Date.now();
}

/** Retains the historic helper name as a compatibility alias for creation time. */
export function now(input = {}) {
	return createdTimestamp(input);
}

/** Marks a live mutable model as changed now and returns the same object identity. */
export function touch(model) {
	model.updatedAt = Date.now();
	return model;
}

/** Returns a detached JSON-safe clone of plain project data. */
export function clonePlain(value) {
	return JSON.parse(JSON.stringify(value ?? null));
}

/** Converts non-array values into the canonical empty-array fallback. */
export function asArray(value) {
	return Array.isArray(value) ? value : [];
}

/** Converts a finite numeric value or returns the supplied fallback. */
export function numberOr(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

/** Asserts one canonical model kind and returns the validated model. */
export function assertKind(model, kind) {
	if (!model || model.kind !== kind) {
		throw new Error(`Expected ${kind} model.`);
	}
	return model;
}
