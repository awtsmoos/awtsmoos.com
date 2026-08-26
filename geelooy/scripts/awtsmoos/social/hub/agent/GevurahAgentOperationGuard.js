//B"H
// Boruch Hashem
// Blessed is He

import { AgentOperationError } from "./AgentOperationError.js";

/**
 * Gevurah boundary enforcing operation mode and explicit autonomous mutation consent.
 *
 * The Awtsmoos renews possibility without dissolving responsibility; Awtsmoos.com
 * therefore refuses to let an agent cross from seeing into changing merely because
 * a method exists, requiring the mutation gate to be opened deliberately and plainly.
 *
 * @module GevurahAgentOperationGuard
 */
export class GevurahAgentOperationGuard {
	/**
	 * Requires that one descriptor exists in the expected read/mutation mode.
	 * @param {object|null} sefirahOperation Candidate descriptor.
	 * @param {string} shemKey Requested operation key.
	 * @param {"read"|"mutation"} gevurahMode Required mode.
	 * @returns {object} Validated descriptor.
	 * @throws {AgentOperationError} When the key is unknown or classified differently.
	 */
	requireMode(sefirahOperation, shemKey, gevurahMode) {
		if (!sefirahOperation || sefirahOperation.mode !== gevurahMode) {
			throw new AgentOperationError({
				message: `Operation ${shemKey} is not a ${gevurahMode} operation.`,
				code: "SOCIAL_OPERATION_MODE_MISMATCH",
				operation: shemKey,
				details: {
					expectedMode: gevurahMode,
					actualMode: sefirahOperation?.mode || "unknown"
				}
			});
		}

		return sefirahOperation;
	}

	/**
	 * Requires the explicit autonomous mutation opt-in.
	 * @param {object} sefirahOperation Mutation descriptor.
	 * @param {boolean} allowMutation Caller opt-in flag.
	 * @returns {void}
	 * @throws {AgentOperationError} When opt-in is absent.
	 */
	requireMutationConsent(sefirahOperation, allowMutation) {
		if (allowMutation) {
			return;
		}

		throw new AgentOperationError({
			message: `Mutation ${sefirahOperation.key} requires allowMutation: true.`,
			code: "SOCIAL_MUTATION_CONFIRMATION_REQUIRED",
			operation: sefirahOperation.key,
			details: { consequence: sefirahOperation.risk }
		});
	}
}
