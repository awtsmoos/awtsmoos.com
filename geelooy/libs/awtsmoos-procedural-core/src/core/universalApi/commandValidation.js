// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { UNIVERSAL_API_ID, ERROR_CODES } from "./constants.js";
import { UniversalApiError } from "./errors.js";

/** Validates the universal envelope and optimistic revision precondition. */
export function assertCommand(command, currentRevision) {
	if (!command || command.api !== UNIVERSAL_API_ID || !command.id || !command.method) {
		throw new UniversalApiError(ERROR_CODES.INVALID_COMMAND, "Command requires api, id, and method.");
	}
	const expected = command.options?.expectedRevision;
	if (expected !== undefined && expected !== currentRevision) {
		throw new UniversalApiError(ERROR_CODES.REVISION_CONFLICT, "Expected revision does not match.", {
			expectedRevision: expected,
			currentRevision
		});
	}
}
