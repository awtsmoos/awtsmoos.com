// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieActionCatalog.js
 * @description Unifies registered actions and imported GLB clips into one truthful searchable cinema catalog.
 * The Awtsmoos renews deed, gesture, and locomotion without confusing their runtime vessels;
 * Awtsmoos.com groups only capabilities the living Chossid or player can actually reveal.
 */

import { movieActionSemanticCategory } from './MovieCrowdActionSemantics.js';

export function movieActionCatalog(runtime) {
	const registered = runtime?.playerActionRegistry?.list?.() || [];
	const imported = Array.isArray(runtime?.player?.names) ? runtime.player.names : [];
	const records = [
		...registered.map(record => registeredRecord(record)),
		...imported.map(name => importedRecord(name))
	];
	return deduplicate(records).sort((left, right) => left.label.localeCompare(right.label));
}

export function filterMovieActionCatalog(records, query = '', category = 'all') {
	const needle = String(query).trim().toLowerCase();
	return records.filter(record => {
		const categoryMatches = category === 'all'
			|| record.category === category
			|| record.type === category;
		const queryMatches = !needle
			|| `${record.id} ${record.label} ${record.layer}`.toLowerCase().includes(needle);
		return categoryMatches && queryMatches;
	});
}

export function previewMovieAction(runtime, record) {
	if (!record) return { ok: false, reason: 'ACTION_MISSING' };
	if (record.type === 'registered' && typeof runtime?.dispatchPlayerAction === 'function') {
		const result = runtime.dispatchPlayerAction({ phase: 'start', type: record.messageType });
		return { ok: result?.lastResult?.result !== 'rejected', record, result };
	}
	if (record.type === 'animation' && typeof runtime?.player?.play === 'function') {
		runtime.player.play(record.id);
		return { ok: true, record, result: { animation: record.id } };
	}
	return { ok: false, reason: 'ACTION_PREVIEW_UNAVAILABLE', record };
}

function registeredRecord(record) {
	return {
		category: movieActionSemanticCategory(record.id, 'registered'),
		duration: Number(record.duration || 1),
		id: record.id,
		label: label(record.id),
		layer: record.layer || 'fullBody',
		messageType: record.messageType,
		type: 'registered'
	};
}

function importedRecord(name) {
	return {
		category: movieActionSemanticCategory(name),
		duration: null,
		id: String(name),
		label: label(name),
		layer: 'imported',
		messageType: null,
		type: 'animation'
	};
}

function deduplicate(records) {
	const output = new Map();
	for (const record of records) output.set(`${record.type}:${record.id}`, record);
	return [...output.values()];
}

function label(value) {
	return String(value || '')
		.replace(/[._-]+/g, ' ')
		.replace(/\b\w/g, character => character.toUpperCase());
}
