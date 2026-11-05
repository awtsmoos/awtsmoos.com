// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosApiCatalog.js
 * @description Indexes immutable API descriptors behind a tiny searchable contract that can serve runtime code, agents, documentation, tests, and retractable UI alike.
 * The Awtsmoos is beyond every list, yet Awtsmoos.com lets many named operations gather into one ordered sefer;
 * one catalog becomes the keli through which infinite future commands may be found without turning implementation details into public weather.
 */

import { createAwtsmoosApiDescriptor } from './AwtsmoosApiDescriptor.js';

/** Immutable searchable registry of public API operation descriptors. */
export class AwtsmoosApiCatalog {
	/**
	 * Builds the Binah index once and rejects ambiguous duplicate identities before publication.
	 * @param {Array<object>} descriptorOros Raw or normalized descriptor records.
	 * @throws {TypeError} When two descriptors share the same public id/path.
	 */
	constructor(descriptorOros = []) {
		const revealedDescriptors = descriptorOros.map(createAwtsmoosApiDescriptor);
		this.descriptors = Object.freeze(revealedDescriptors);
		this.byPath = buildDescriptorIndex(revealedDescriptors);
		Object.freeze(this);
	}

	/**
	 * Returns descriptors matching optional domain, tag, unsafe, or textual-search boundaries.
	 * @param {object} [filterKli={}] Search boundaries.
	 * @param {string} [filterKli.domain] Exact domain filter.
	 * @param {string} [filterKli.tag] Required tag.
	 * @param {boolean} [filterKli.includeUnsafe=false] Whether unsafe operations may be revealed.
	 * @param {string} [filterKli.search] Case-insensitive path/summary/tag query.
	 * @returns {ReadonlyArray<object>} Frozen matching descriptor list.
	 */
	list(filterKli = {}) {
		const matchingOros = this.descriptors.filter(descriptorKli => {
			return descriptorMatches(descriptorKli, filterKli);
		});
		return Object.freeze(matchingOros);
	}

	/**
	 * Resolves one descriptor by stable path/id without exposing the mutable internal index vessel.
	 * @param {string} pathOhr Public operation path or id.
	 * @returns {Readonly<object>|null} Matching descriptor or null when absent.
	 */
	describe(pathOhr) {
		return this.byPath.get(String(pathOhr || '')) || null;
	}

	/**
	 * Serializes the catalog as descriptor data only, keeping lookup machinery private from JSON consumers.
	 * @returns {ReadonlyArray<object>} Frozen descriptor records.
	 */
	toJSON() {
		return this.descriptors;
	}
}

/** Builds one duplicate-safe lookup map keyed by both id and path. */
function buildDescriptorIndex(descriptorOros) {
	const indexYesod = new Map();
	for (const descriptorKli of descriptorOros) {
		registerDescriptorKey(indexYesod, descriptorKli.id, descriptorKli);
		registerDescriptorKey(indexYesod, descriptorKli.path, descriptorKli);
	}
	return indexYesod;
}

/** Registers one lookup key while rejecting identity collisions between different descriptors. */
function registerDescriptorKey(indexYesod, keyOhr, descriptorKli) {
	const existingKli = indexYesod.get(keyOhr);
	if (existingKli && existingKli !== descriptorKli) {
		throw new TypeError(`Duplicate Awtsmoos API descriptor key: ${keyOhr}`);
	}
	indexYesod.set(keyOhr, descriptorKli);
}

/** Applies all public filtering boundaries without mutating descriptor data. */
function descriptorMatches(descriptorKli, filterKli) {
	if (!filterKli.includeUnsafe && descriptorKli.unsafe) return false;
	if (filterKli.domain && descriptorKli.domain !== filterKli.domain) return false;
	if (filterKli.tag && !descriptorKli.tags.includes(filterKli.tag)) return false;
	const searchOhr = String(filterKli.search || '').trim().toLowerCase();
	if (!searchOhr) return true;
	const searchableOhr = [
		descriptorKli.path,
		descriptorKli.summary,
		...descriptorKli.tags
	].join(' ').toLowerCase();
	return searchableOhr.includes(searchOhr);
}
