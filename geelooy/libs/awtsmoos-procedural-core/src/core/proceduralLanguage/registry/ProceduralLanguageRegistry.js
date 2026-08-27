//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralLanguageRegistry.js
 * @description Stores truthful operation capability, aliases, execution mode, stability, deprecation, provenance, and optional runtime handlers for the universal language.
 * The Awtsmoos is beyond every operation name while Awtsmoos.com gives each verb an honest vessel of capability and history;
 * extension remains deterministic so plugins may add light without silently rewriting stable law or obscuring a deprecated mystery.
 */

import {
	LANGUAGE_EXECUTION,
	LANGUAGE_STABILITY
} from '../contract/ProceduralLanguageContract.js';

/** Registry whose serializable descriptions stay separate from optional runtime handler functions. */
export class ProceduralLanguageRegistry {
	constructor() {
		this.operations = new Map();
		this.aliases = new Map();
	}

	/** Registers one operation and aliases under explicit overwrite policy. */
	register(input, options = {}) {
		const record = normalizeOperation(input);
		if (this.operations.has(record.op) && options.override !== true) {
			throw new Error(`B"H | Procedural language operation already registered: ${record.op}`);
		}
		this.operations.set(record.op, record);
		for (const alias of record.aliases) {
			if (!this.aliases.has(alias) || options.override === true) {
				this.aliases.set(alias, record.op);
			}
		}
		return this;
	}

	/** Resolves canonical operation metadata by id or alias. */
	resolve(op) {
		const requested = String(op || '');
		const canonical = this.operations.has(requested)
			? requested
			: this.aliases.get(requested);
		const record = canonical
			? this.operations.get(canonical)
			: null;
		if (!record) {
			const error = new Error(`B"H | Unknown procedural language operation: ${requested}`);
			error.code = 'LANGUAGE_OPERATION_NOT_FOUND';
			throw error;
		}
		return record;
	}

	/** Returns serializable operation metadata without runtime handler functions. */
	describe() {
		return Object.freeze([...this.operations.values()]
			.sort((left, right) => left.op.localeCompare(right.op))
			.map(describeOperation));
	}
}

/** Normalizes one runtime operation record into immutable registry truth. */
function normalizeOperation(input = {}) {
	const op = String(input.op || input.id || '');
	if (!op) {
		throw new TypeError('B"H | Language operation requires op.');
	}
	return Object.freeze({
		op,
		aliases: Object.freeze([...(input.aliases || [])].map(String)),
		execution: input.execution || LANGUAGE_EXECUTION.DESCRIPTOR,
		source: String(input.source || 'procedural-language'),
		stability: input.stability || LANGUAGE_STABILITY.STABLE,
		category: String(input.category || 'general'),
		definitionId: input.definitionId || null,
		deprecatedSince: input.deprecatedSince || null,
		replacement: input.replacement || null,
		removalVersion: input.removalVersion || null,
		handler: typeof input.handler === 'function' ? input.handler : null
	});
}

/** Projects runtime operation truth into portable discovery metadata. */
function describeOperation(record) {
	return Object.freeze({
		op: record.op,
		aliases: record.aliases,
		execution: record.execution,
		source: record.source,
		stability: record.stability,
		category: record.category,
		definitionId: record.definitionId,
		deprecatedSince: record.deprecatedSince,
		replacement: record.replacement,
		removalVersion: record.removalVersion
	});
}
