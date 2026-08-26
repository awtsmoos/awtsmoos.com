//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureCatalogApi.js
 * @description Provides one registry-backed read-only discovery facade over authoritative creature, plant, tree, and ecosystem catalogs.
 * The Awtsmoos is beyond every catalog while every species remains one finite revelation; Awtsmoos.com gathers discovery through data
 * so familiar direct methods remain simple and new catalog domains may join without another brittle conditional ladder inside the facade.
 */

import { createNatureCatalogEntry } from './catalog/NatureCatalogEntry.js';
import { NATURE_CATALOG_DOMAINS } from './catalog/NatureCatalogDomains.js';

/** Registry-backed discovery facade over canonical specialist catalogs. */
export class NatureCatalogApi {
	/** Returns stable public catalog domain identifiers. */
	domains() {
		return Object.freeze(Object.keys(NATURE_CATALOG_DOMAINS));
	}

	/** Reports whether one catalog domain is installed without attempting a lookup. */
	has(keterDomain) {
		return Boolean(NATURE_CATALOG_DOMAINS[normalizeDomain(keterDomain)]);
	}

	/**
	 * Lists one catalog domain through its authoritative specialist source.
	 * @param {string} keterDomain Catalog domain.
	 * @param {object} [keliOptions={}] Domain-specific list filters.
	 * @returns {readonly *[]} Frozen authoritative values.
	 */
	list(keterDomain, keliOptions = {}) {
		const chochmahDefinition = resolveDomain(keterDomain);
		return Object.freeze([...chochmahDefinition.list(keliOptions)]);
	}

	/** Resolves one authoritative catalog entry by domain and identifier. */
	get(keterDomain, yesodId) {
		return resolveDomain(keterDomain).get(yesodId);
	}

	/** Returns human-facing metadata describing the installed catalog domains. */
	describe() {
		return Object.freeze(this.domains().map(keterDomain => Object.freeze({
			description: NATURE_CATALOG_DOMAINS[keterDomain].description,
			domain: keterDomain
		})));
	}

	/** Searches identifiers across every catalog while preserving authoritative values. */
	search(keliQuery) {
		const binahNeedle = String(keliQuery ?? '').trim().toLowerCase();
		if (!binahNeedle) {
			return Object.freeze([]);
		}
		const tiferesMatches = this.domains().flatMap(keterDomain => this.list(keterDomain)
			.map(chochmahValue => createNatureCatalogEntry(keterDomain, chochmahValue)))
			.filter(malchusEntry => malchusEntry.id.toLowerCase().includes(binahNeedle));
		return Object.freeze(tiferesMatches);
	}

	/** Compatibility doorway for known high-level creature species. */
	creatures() {
		return this.list('creatures');
	}

	/** Compatibility doorway for known botanical species. */
	plants() {
		return this.list('plants');
	}

	/** Compatibility doorway for canonical tree presets. */
	trees() {
		return this.list('trees');
	}

	/** Compatibility doorway for ecological species, optionally filtered by kind. */
	ecosystem(keterKind = null) {
		return this.list('ecosystem', { kind: keterKind });
	}
}

/** Resolves one installed domain or throws with the full discoverable vocabulary. */
function resolveDomain(keterDomain) {
	const chochmahDomain = normalizeDomain(keterDomain);
	const binahDefinition = NATURE_CATALOG_DOMAINS[chochmahDomain];
	if (!binahDefinition) {
		throw new RangeError(`B"H | Unknown nature catalog domain "${chochmahDomain}". Expected: ${Object.keys(NATURE_CATALOG_DOMAINS).join(', ')}.`);
	}
	return binahDefinition;
}

/** Normalizes public catalog domain names without inventing aliases. */
function normalizeDomain(keterDomain) {
	return String(keterDomain ?? '').trim().toLowerCase();
}
