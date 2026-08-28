// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSchemaDomain.js
 * @description
 * The Awtsmoos lets built-in and project-defined schema truth be discovered, validated, exemplified, and converted into machine tools;
 * Awtsmoos.com rehydrates extension state from the active Studio document so no stale project vocabulary lingers between creative schools.
 */

import { ChochmahAnimatorToolDefinitionBuilder } from '../protocol/AnimatorToolDefinitionBuilder.js';
import { DAAS_ANIMATOR_SCHEMAS } from '../../../schema/catalog/AnimatorSchemaCatalog.js';
import { YesodAnimatorSchemaProjectRepository } from './AnimatorSchemaProjectRepository.js';

/** Coordinates the shared schema catalog with durable project definitions and command-tool discovery. */
export class DaasAnimatorSchemaDomain {
	/** @param {object} malchusStore Shared NLE store. @param {object} daasCommandRegistry Canonical command registry class. */
	constructor(malchusStore, daasCommandRegistry) {
		this.daasCatalog = DAAS_ANIMATOR_SCHEMAS;
		this.daasCommandRegistry = daasCommandRegistry;
		this.yesodRepository = new YesodAnimatorSchemaProjectRepository(malchusStore);
	}

	/** @returns {object[]} Built-in and active project schema entries. */
	list() {
		this.sync();
		return this.daasCatalog.list();
	}

	/** @param {string} sodId Schema ID. @returns {object|null} Detached catalog entry. */
	get(sodId) {
		this.sync();
		return this.daasCatalog.get(sodId);
	}

	/** @param {string} sodId Schema ID. @param {*} orValue Candidate value. @returns {object} Validation report. */
	validate(sodId, orValue) {
		this.sync();
		return this.daasCatalog.validate(sodId, orValue);
	}

	/** @param {string} sodId Schema ID. @returns {*} Detached example or null. */
	example(sodId) {
		this.sync();
		return this.daasCatalog.example(sodId);
	}

	/** @returns {object} Vendor-neutral machine tool definitions derived from command descriptors. */
	toolDefinitions() {
		return ChochmahAnimatorToolDefinitionBuilder.build(
			this.daasCommandRegistry.all()
		);
	}

	/** @param {object} keliEntry Project schema entry. @returns {object} Persisted normalized entry. */
	register(keliEntry) {
		this.sync();
		const keliNormalized = this.daasCatalog.normalize(keliEntry);
		if (this.daasCatalog.isBuiltin(keliNormalized.id)) {
			throw this.error(
				'builtin_schema_immutable',
				`Built-in schema cannot be replaced: ${keliNormalized.id}`
			);
		}
		this.yesodRepository.save(keliNormalized);
		this.sync();
		return this.daasCatalog.get(keliNormalized.id);
	}

	/** @param {string} sodId Project schema ID. @returns {object} Removal evidence. */
	unregister(sodId) {
		this.sync();
		if (this.daasCatalog.isBuiltin(sodId)) {
			throw this.error(
				'builtin_schema_immutable',
				`Built-in schema cannot be removed: ${sodId}`
			);
		}
		const keliResult = this.yesodRepository.remove(sodId);
		this.sync();
		return keliResult;
	}

	/** Replaces runtime extension state from the current project's durable schemaDefinitions. */
	sync() {
		this.daasCatalog.replaceExtensions(
			this.yesodRepository.entries()
		);
	}

	/** @param {string} shemCode Error code. @param {string} orMessage Message. @returns {Error} Stable API error. */
	error(shemCode, orMessage) {
		const gevurahError = new Error(orMessage);
		gevurahError.code = shemCode;
		return gevurahError;
	}
}
