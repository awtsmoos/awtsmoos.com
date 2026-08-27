// B"H

import { createStableId } from "../artifacts/index.js";
import { normalizeResourceBudget } from "../budgets/index.js";
import { hashCanonicalValue, normalizeCanonicalValue } from "../canonical/index.js";
import { createDataPatch } from "../patches/index.js";

const HASH_PATTERN = /^[a-z0-9-]+:[0-9a-f]+$/i;

/** Creates an immutable atomic-change intent with an exact base precondition. */
export function createTransaction(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Transaction input must be an object.");
	}
	if (typeof input.expectedBaseHash !== "string" || !HASH_PATTERN.test(input.expectedBaseHash)) {
		throw new TypeError("Transaction expectedBaseHash is required and must be well formed.");
	}
	if (!Array.isArray(input.patches)) {
		throw new TypeError("Transaction patches must be an array.");
	}
	const patches = Object.freeze(input.patches.map(createDataPatch));
	const content = Object.freeze({
		expectedBaseHash: input.expectedBaseHash,
		patches,
		resourceBudget: normalizeResourceBudget(input.resourceBudget ?? {}),
		metadata: normalizeCanonicalValue(input.metadata ?? {})
	});
	const contentHash = hashCanonicalValue(content);
	return Object.freeze({
		transactionSchema: "awtsmoos.transaction",
		id: input.id ?? createStableId("transaction", content),
		contentHash,
		state: "open",
		...content
	});
}
