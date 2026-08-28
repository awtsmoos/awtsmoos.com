// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSchemaCatalog.js
 * @description
 * The Awtsmoos lets built-in and project-defined schemas share one doorway while immutable foundations remain protected from overwrite;
 * Awtsmoos.com replaces extension state from the active document, preventing one project's schema memory from haunting another route.
 */

import { TiferesJsonSchemaLiteValidator } from '../JsonSchemaLiteValidator.js';
import { OR_ANIMATOR_SCHEMA_ENTRIES } from './AnimatorSchemaCatalogEntries.js';

/** Runtime catalog of immutable built-ins plus replaceable explicit project extension schemas. */
export class DaasAnimatorSchemaCatalog {
	constructor() {
		this.builtins = new Map(
			OR_ANIMATOR_SCHEMA_ENTRIES.map((keliEntry) => [keliEntry.id, keliEntry])
		);
		this.extensions = new Map();
	}

	/** @param {object} keliEntry Extension entry with id/label/schema. @returns {object} Detached registered entry. */
	register(keliEntry = {}) {
		const keliNormalized = this.normalize(keliEntry);
		if (this.builtins.has(keliNormalized.id)) {
			throw new Error(`Built-in schema cannot be replaced: ${keliNormalized.id}`);
		}
		this.extensions.set(
			keliNormalized.id,
			Object.freeze(keliNormalized)
		);
		return structuredClone(keliNormalized);
	}

	/** @param {object[]} sederEntries Complete project extension set. @returns {object[]} Detached resulting extension entries. */
	replaceExtensions(sederEntries = []) {
		this.extensions.clear();
		for (const keliEntry of sederEntries) {
			this.register(keliEntry);
		}
		return this.extensionList();
	}

	/** @param {string} sodId Extension ID. @returns {boolean} True when an extension existed and was removed. */
	unregister(sodId) {
		if (this.builtins.has(sodId)) {
			throw new Error(`Built-in schema cannot be removed: ${sodId}`);
		}
		return this.extensions.delete(sodId);
	}

	/** @returns {object[]} Detached built-in and project schema entries. */
	list() {
		return [
			...this.builtins.values(),
			...this.extensions.values()
		].map((keliEntry) => structuredClone(keliEntry));
	}

	/** @returns {object[]} Detached project-only extension entries. */
	extensionList() {
		return [...this.extensions.values()]
			.map((keliEntry) => structuredClone(keliEntry));
	}

	/** @param {string} sodId Schema ID. @returns {object|null} Detached entry. */
	get(sodId) {
		const keliEntry = this.extensions.get(sodId)
			?? this.builtins.get(sodId);
		return keliEntry ? structuredClone(keliEntry) : null;
	}

	/** @param {string} sodId Schema ID. @param {*} orValue Candidate data. @returns {object} Validation report. */
	validate(sodId, orValue) {
		const keliEntry = this.get(sodId);
		if (!keliEntry) {
			return {
				valid: false,
				issues: [
					{
						path: '$',
						keyword: 'schema',
						message: `Unknown schema: ${sodId}`
					}
				]
			};
		}
		return TiferesJsonSchemaLiteValidator.validate(
			orValue,
			keliEntry.schema
		);
	}

	/** @param {string} sodId Schema ID. @returns {*} Detached example or null. */
	example(sodId) {
		return this.get(sodId)?.example ?? null;
	}

	/** @param {string} sodId Schema ID. @returns {boolean} True when ID belongs to immutable built-ins. */
	isBuiltin(sodId) {
		return this.builtins.has(sodId);
	}

	/** @param {object} keliEntry Candidate extension entry. @returns {object} Normalized detached entry. */
	normalize(keliEntry = {}) {
		const sodId = String(keliEntry.id ?? '').trim();
		if (!sodId || !keliEntry.schema || typeof keliEntry.schema !== 'object') {
			throw new TypeError('Schema registration requires id and schema object.');
		}
		return {
			id: sodId,
			label: String(keliEntry.label ?? sodId),
			group: String(keliEntry.group ?? 'project'),
			schema: structuredClone(keliEntry.schema),
			example: structuredClone(keliEntry.example ?? null)
		};
	}
}

/** Shared catalog rehydrated from the active Studio document before public schema reads. */
export const DAAS_ANIMATOR_SCHEMAS = new DaasAnimatorSchemaCatalog();
