// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { UNIVERSAL_API_ID } from "./constants.js";

/** Builds the stable successful command envelope. */
export function createResultEnvelope(input) {
	return {
		api: UNIVERSAL_API_ID,
		id: input.command.id,
		ok: true,
		transactionId: input.transactionId,
		revisionBefore: input.before,
		revisionAfter: input.after,
		created: input.changes.created,
		updated: input.changes.updated,
		deleted: input.changes.deleted,
		warnings: input.changes.warnings,
		validation: input.validation,
		result: input.result,
		undo: {
			available: input.changes.mutated,
			transactionId: input.transactionId
		}
	};
}
