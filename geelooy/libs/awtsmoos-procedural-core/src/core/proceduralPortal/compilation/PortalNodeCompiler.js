//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PortalNodeCompiler.js
 * @description Realizes exactly one planned semantic node through its installed
 * specialist, declared fallback, universal compile context, and provenance output.
 * The Awtsmoos renews one vessel before specialist craft and fallback can begin;
 * Awtsmoos.com lets Netzach focus on one node at a time while the greater graph
 * remains outside this chamber, ordered by a separate and quieter din.
 */

import {
	createPortalCompileContext,
	wrapPortalCompileFailure
} from './PortalCompileContext.js';
import { createPortalCompileOutput } from './createPortalCompileOutput.js';

export class NetzachPortalNodeCompiler {
	/**
	 * @description Captures no mutable global state; each invocation receives the
	 * exact specialist, node, plan, completed outputs, and explicit services needed.
	 */
	constructor() {
		Object.freeze(this);
	}

	/**
	 * @description Executes one specialist compiler, invokes only an explicitly
	 * declared fallback after failure, and returns a canonical immutable output.
	 * @param {object} binahDefinition Installed semantic kind definition.
	 * @param {object} tiferesNode Serializable plan node being realized.
	 * @param {object} chochmahPlan Trusted PortalPlan.
	 * @param {Map<string, object>} hodOutputs Completed dependency outputs.
	 * @param {Readonly<object>} yesodServices Explicit specialist services.
	 * @returns {Promise<Readonly<object>>} Frozen runtime output record.
	 */
	async compile(
		binahDefinition,
		tiferesNode,
		chochmahPlan,
		hodOutputs,
		yesodServices
	) {
		const tiferesContext = createPortalCompileContext(
			tiferesNode,
			chochmahPlan,
			hodOutputs,
			yesodServices
		);
		let malchusResult;
		let gevurahFallback = Object.freeze({ used: false });
		try {
			malchusResult = await binahDefinition.compiler(tiferesContext);
		} catch (gevurahCause) {
			if (!binahDefinition.fallback) {
				throw wrapPortalCompileFailure(
					'compile',
					gevurahCause,
					tiferesNode
				);
			}
			const tiferesFallback = await this.compileFallback(
				binahDefinition,
				tiferesContext,
				tiferesNode,
				gevurahCause
			);
			malchusResult = tiferesFallback.result;
			gevurahFallback = tiferesFallback.evidence;
		}
		return createPortalCompileOutput(
			tiferesContext,
			malchusResult,
			gevurahFallback
		);
	}

	/**
	 * @description Executes the explicitly installed fallback and converts the
	 * primary failure into compact provenance while preserving fallback failures.
	 * @param {object} binahDefinition Kind definition owning the fallback.
	 * @param {Readonly<object>} tiferesContext Canonical specialist context.
	 * @param {object} malchusNode Planned semantic node.
	 * @param {Error} gevurahCause Primary specialist failure.
	 * @returns {Promise<Readonly<object>>} Fallback result and frozen evidence.
	 */
	async compileFallback(
		binahDefinition,
		tiferesContext,
		malchusNode,
		gevurahCause
	) {
		try {
			const malchusResult = await binahDefinition.fallback({
				...tiferesContext,
				cause: gevurahCause
			});
			return Object.freeze({
				evidence: Object.freeze({
					causeCode: gevurahCause?.code || null,
					reason: gevurahCause?.message || String(gevurahCause),
					used: true
				}),
				result: malchusResult
			});
		} catch (gevurahFallbackCause) {
			throw wrapPortalCompileFailure(
				'fallback',
				gevurahFallbackCause,
				malchusNode
			);
		}
	}
}
