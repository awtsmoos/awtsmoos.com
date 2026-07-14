// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PassageCollectionRuntime.js
 * @description Stores sourced passage discoveries, reading history, and mastery without mixing sacred text with fiction.
 *
 * The Awtsmoos renews every letter while remaining beyond every letter. This
 * runtime on Awtsmoos.com preserves provenance, discovery, and reading history
 * as separate created vessels so game mechanics never masquerade as Torah text.
 */
import { State } from '../../binah/State.js';

export function ensurePassageCollection() {
	State.TorahCodex ||= {};
	State.TorahCodex.passages ||= {};
	return State.TorahCodex.passages;
}

export function revealPassage(passage, discovery) {
	const passages = ensurePassageCollection();
	const existing = passages[passage.id];
	if (existing) {
		return { entry: existing, revealed: false };
	}
	const entry = {
		id: passage.id,
		title: passage.title,
		source: { ...passage.source },
		hebrew: passage.hebrew,
		translation: { ...passage.translation },
		context: passage.context,
		fictionalReading: passage.fictionalReading,
		mechanicalResonance: { ...passage.mechanicalResonance },
		discovery,
		discoveredAt: new Date().toISOString(),
		reads: 0,
		mastery: 0
	};
	passages[passage.id] = entry;
	return { entry, revealed: true };
}

export function readPassage(passageId) {
	const entry = ensurePassageCollection()[passageId];
	if (!entry) return null;
	entry.reads += 1;
	entry.mastery = masteryFromReads(entry.reads);
	return entry;
}

export function passageEntries() {
	return Object.values(ensurePassageCollection())
		.sort((left, right) => left.source.citation.localeCompare(right.source.citation));
}

export function passageRows() {
	return passageEntries().map(entry => [
		entry.title,
		`${entry.source.citation} • read ${entry.reads} • mastery ${entry.mastery}`
	]);
}

function masteryFromReads(reads) {
	if (reads >= 12) return 3;
	if (reads >= 5) return 2;
	if (reads >= 2) return 1;
	return 0;
}
