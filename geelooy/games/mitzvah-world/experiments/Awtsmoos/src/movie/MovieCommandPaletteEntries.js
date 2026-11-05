// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCommandPaletteEntries.js
 * @description Deduplicates, filters, sorts, and availability-marks command descriptions for human surfaces.
 * The Awtsmoos renews every action beyond alias and search; Awtsmoos.com lets desktop keys
 * and mobile taps discover one finite command while payload and selection requirements remain honest.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function prepareMovieCommandPaletteEntries(
	catalog,
	query = '',
	canExecute = () => true
) {
	const byInternalName = new Map();
	for (const descriptor of catalog || []) {
		const current = byInternalName.get(descriptor.internalName);
		if (!current || preferredMovieCommandAlias(descriptor, current)) {
			byInternalName.set(descriptor.internalName, descriptor);
		}
	}
	const search = String(query || '').trim().toLowerCase();
	const entries = [...byInternalName.values()]
		.map(descriptor => movieCommandPaletteEntry(descriptor, canExecute))
		.filter(entry => !search || movieCommandEntryText(entry).includes(search))
		.sort((left, right) => (
			left.category.localeCompare(right.category)
			|| left.title.localeCompare(right.title)
		));
	return createMovieProjectSnapshot(entries);
}

function movieCommandPaletteEntry(descriptor, canExecute) {
	const payloadRequired = Object.values(descriptor.payload || {})
		.some(description => String(description).startsWith('Required'));
	const available = !payloadRequired && Boolean(canExecute(descriptor.name));
	return {
		available,
		category: descriptor.category,
		disabledReason: payloadRequired
			? 'Requires additional input.'
			: available
				? null
				: 'Unavailable in the current editor state.',
		internalName: descriptor.internalName,
		name: descriptor.name,
		requiresSelection: descriptor.requiresSelection,
		shortcut: descriptor.shortcut,
		title: descriptor.title
	};
}

function preferredMovieCommandAlias(candidate, current) {
	return candidate.name.includes('.') && !current.name.includes('.');
}

function movieCommandEntryText(entry) {
	return [
		entry.category,
		entry.internalName,
		entry.name,
		entry.shortcut,
		entry.title
	].filter(Boolean).join(' ').toLowerCase();
}
