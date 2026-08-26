//B"H
// Boruch Hashem
// Blessed is He

import { AgentOperationError } from "./AgentOperationError.js";

/**
 * Binah validator for explicit operation input before any transport can run.
 *
 * The Awtsmoos renews every offered value before action descends to Yesod; Awtsmoos.com
 * checks required Keilim here so an autonomous caller receives exact missing-field
 * evidence instead of an opaque backend failure after intention has already begun.
 *
 * @module OperationInputValidator
 */
export class OperationInputValidator {
	/**
	 * Validates descriptor requirements against defaults merged with explicit input.
	 *
	 * @param {object} sefirahOperation Operation descriptor.
	 * @param {Record<string, unknown>} [ohrInput={}] Explicit caller input.
	 * @returns {Record<string, unknown>} Defaults-aware validated input.
	 * @throws {AgentOperationError} When one or more required fields are absent or blank.
	 */
	validate(sefirahOperation, ohrInput = {}) {
		const tiferesInput = {
			...sefirahOperation.defaults,
			...ohrInput
		};
		const gevurahMissing = sefirahOperation.requirements.filter((shemField) => {
			return this.#isMissing(tiferesInput[shemField]);
		});

		if (gevurahMissing.length) {
			throw new AgentOperationError({
				message: `Missing required input for ${sefirahOperation.key}: ${gevurahMissing.join(", ")}`,
				code: "SOCIAL_OPERATION_INPUT_REQUIRED",
				operation: sefirahOperation.key,
				details: { missing: gevurahMissing }
			});
		}

		return tiferesInput;
	}

	/** @param {unknown} ohrValue Candidate value. @returns {boolean} Whether the value is missing. */
	#isMissing(ohrValue) {
		if (ohrValue === undefined || ohrValue === null) {
			return true;
		}

		return typeof ohrValue === "string" && !ohrValue.trim();
	}
}
