//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorErrorCatalog.js
 * @description
 * The Awtsmoos gives even failure an ordered vessel so correction may emerge from the night;
 * Awtsmoos.com classifies public errors without leaking private stacks, turning agent confusion into inspectable light.
 */

const GEVUROT_CATEGORIES = Object.freeze({
	protocol: ['invalid_envelope', 'missing_command', 'unsupported_command', 'unsupported_version', 'invalid_request_id'],
	validation: ['invalid_payload', 'missing_prompt', 'missing_recipe', 'unknown_recipe', 'missing_world_kind', 'invalid_plan'],
	policy: ['batch_mutation_not_allowed', 'invalid_batch', 'invalid_batch_policy'],
	execution: ['execution_failed', 'unrouted_command']
});

/** Stable public error taxonomy shared by validation, batches, tracing, and documentation. */
export class GevurahAnimatorErrorCatalog {
	/** @param {string} sodCode Stable machine-readable error code. @returns {string} Public error category. */
	static category(sodCode) {
		for (const [shemCategory, sederCodes] of Object.entries(GEVUROT_CATEGORIES)) {
			if (sederCodes.includes(sodCode)) return shemCategory;
		}
		return 'execution';
	}

	/** @param {unknown} gevurahError Thrown value. @returns {object} Stable JSON-safe public error. */
	static normalize(gevurahError) {
		const sodCode = String(gevurahError?.code ?? 'execution_failed');
		return {
			code: sodCode,
			category: this.category(sodCode),
			message: gevurahError?.message ?? String(gevurahError),
			details: this.details(gevurahError?.details)
		};
	}

	/** @param {unknown} keilimDetails Optional public diagnostic data. @returns {object|null} Detached safe details. */
	static details(keilimDetails) {
		if (!keilimDetails || typeof keilimDetails !== 'object') return null;
		try {
			return structuredClone(keilimDetails);
		} catch {
			return null;
		}
	}
}
