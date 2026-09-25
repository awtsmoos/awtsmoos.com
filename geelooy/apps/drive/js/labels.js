//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveLabels
 * @description Label helpers over the shared entry-metadata contract.
 * Labels are short human words kept beside the file; the entry itself is the
 * store, and entryMetadata.js owns every write. Colors are deterministic
 * chip tones so the same label always wears the same garment.
 */
import { getMetadata, updateMetadata } from './entryMetadata.js';

const MAX_LABEL = 48;
const MAX_LABELS = 32;
const TONE_COUNT = 8;

/** Normalizes one label for storage: trimmed, single-spaced, bounded. */
export function normalizeLabel(label) {
	return String(label || '').trim().replace(/\s+/g, ' ').slice(0, MAX_LABEL);
}

/** Returns the entry's labels; tolerates entries that predate the field. */
export function getLabels(entry = {}) {
	return getMetadata(entry?.entry || entry).labels.map(normalizeLabel).filter(Boolean);
}

/** Replaces the entry's labels through the single metadata write path. */
export function setLabels(entry, labels = [], options = {}) {
	const clean = [...new Set(
		(Array.isArray(labels) ? labels : []).map(normalizeLabel).filter(Boolean)
	)].slice(0, MAX_LABELS);
	return updateMetadata(entry?.entry || entry, { labels: clean }, options);
}

/** Adds one label, keeping existing labels and ignoring case duplicates. */
export function addLabel(entry, label, options = {}) {
	const clean = normalizeLabel(label);
	const target = entry?.entry || entry;
	const current = getLabels(target);
	if (!clean) return updateMetadata(target, { labels: current }, options);
	if (current.some(existing => existing.toLowerCase() === clean.toLowerCase())) {
		return updateMetadata(target, { labels: current }, options);
	}
	return setLabels(target, [...current, clean], options);
}

/** Removes one label, matching case-insensitively. */
export function removeLabel(entry, label, options = {}) {
	const target = entry?.entry || entry;
	const want = normalizeLabel(label).toLowerCase();
	return setLabels(target, getLabels(target).filter(existing => existing.toLowerCase() !== want), options);
}

/** Aggregates every distinct label across entries, sorted for filter UI. */
export function allLabels(entries = []) {
	const seen = new Map();
	for (const item of entries || []) {
		for (const label of getLabels(item?.entry || item)) {
			const key = label.toLowerCase();
			if (!seen.has(key)) seen.set(key, label);
		}
	}
	return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

/** Maps one label to a deterministic chip tone class suffix (tone-0..tone-7). */
export function labelColor(label) {
	const value = Array.from(String(label || '')).reduce((sum, character) => sum + character.codePointAt(0), 0);
	return `tone-${value % TONE_COUNT}`;
}
