//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalKindDefinition.js
 * @description Defines one semantic world kind while validation and lookup mechanics remain in smaller dedicated vessels.
 * The Awtsmoos gives every finite kind a truthful name while remaining beyond every name; Awtsmoos.com lets schema, aliases,
 * capabilities, cost evidence, explicit fallback, and runtime compilation travel together without becoming one sprawling generator flame.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';
import {
	normalizePortalAliases,
	normalizePortalKind,
	normalizePortalVersion,
	optionalPortalFunction,
	requirePortalFunction
} from './PortalKindValidation.js';

export { normalizePortalKind } from './PortalKindValidation.js';

const STABILITIES = Object.freeze(['experimental', 'internal', 'stable']);

/** Immutable semantic-kind definition used by one Portal registry instance. */
export class PortalKindDefinition {
	/**
	 * @description Validates semantic metadata and preserves specialist runtime functions behind one sealed definition.
	 * @param {object} input Kind metadata plus runtime compiler hooks.
	 * @param {string} input.kind Canonical namespaced semantic kind.
	 * @param {string[]} [input.aliases=[]] Friendly names resolving to the canonical kind.
	 * @param {Function} input.compiler Runtime specialist compiler invoked after planning succeeds.
	 * @param {Function} [input.fallback] Explicit alternate compiler used only when primary compilation fails.
	 * @param {Function} [input.dependencyFactory] Synchronous semantic dependency-recipe factory.
	 * @param {Function} [input.estimator] Synchronous finite-demand estimator.
	 * @returns {PortalKindDefinition} Frozen semantic kind definition.
	 */
	constructor(input = {}) {
		this.kind = normalizePortalKind(input.kind);
		this.aliases = normalizePortalAliases(input.aliases, this.kind);
		this.version = normalizePortalVersion(input.version);
		this.stability = STABILITIES.includes(input.stability)
			? input.stability
			: 'stable';
		this.description = String(input.description || '').trim();
		this.mode = input.mode === 'async' ? 'async' : 'sync';
		this.fields = freezeLanguageValue(input.fields || []);
		this.capabilities = freezeLanguageValue(input.capabilities || {});
		this.compiler = requirePortalFunction(input.compiler, 'compiler', this.kind);
		this.fallback = optionalPortalFunction(input.fallback, 'fallback', this.kind);
		this.dependencyFactory = optionalPortalFunction(input.dependencyFactory, 'dependencyFactory', this.kind);
		this.estimator = optionalPortalFunction(input.estimator, 'estimator', this.kind);
		Object.freeze(this);
	}

	/**
	 * @description Returns JSON-safe discovery metadata while runtime functions remain private to trusted execution.
	 * @returns {Readonly<object>} Frozen serializable descriptor for editors, docs, and capability negotiation.
	 */
	describe() {
		return freezeLanguageValue({
			aliases: this.aliases,
			capabilities: {
				...this.capabilities,
				hasFallback: Boolean(this.fallback)
			},
			description: this.description,
			fields: this.fields,
			kind: this.kind,
			mode: this.mode,
			stability: this.stability,
			version: this.version
		});
	}
}
