// B"H
// Boruch Hashem
// Blessed is He

import { cloneCreatureValue } from "./clone.js";
import { CreatureOperationError } from "./contracts.js";
import { createSemanticId } from "./identity.js";

/**
 * Owns local creature artifacts and transaction drafts. This store is a vessel
 * for the existing library API—not networking, persistence, or a parallel service.
 * Every revision is isolated so the Awtsmoos-inspired renewal of state never
 * aliases a prior historical vessel.
 */
export class CreatureKernelStore {
	constructor() {
		this.records = new Map();
		this.transactions = new Map();
		this.sequence = 0;
	}

	nextId(prefix, ancestry = []) {
		this.sequence += 1;
		return createSemanticId(prefix, ...ancestry, this.sequence);
	}

	createRecord(document, genome, options = {}) {
		const artifactId = options.artifactId || this.nextId("creature-artifact", [document.id]);
		const record = {
			artifactId,
			genome: cloneCreatureValue(genome),
			document: cloneCreatureValue(document),
			origin: cloneCreatureValue(document),
			undoStack: [],
			redoStack: [],
			history: [],
			compiled: null,
			previousCompiled: null,
			branchOf: options.branchOf || null
		};
		this.records.set(artifactId, record);
		return record;
	}

	requireRecord(artifactId) {
		const record = this.records.get(artifactId);
		if (!record) {
			throw new CreatureOperationError("CREATURE_TARGET_NOT_FOUND", `Unknown creature artifact: ${artifactId}`);
		}
		return record;
	}

	requireTransaction(transactionId) {
		const transaction = this.transactions.get(transactionId);
		if (!transaction) {
			throw new CreatureOperationError("CREATURE_TRANSACTION_NOT_FOUND", `Unknown transaction: ${transactionId}`);
		}
		return transaction;
	}

	resolveDocument(request) {
		if (request.transactionId) {
			return this.requireTransaction(request.transactionId).draft;
		}
		return this.requireRecord(request.target?.artifactId).document;
	}
}
