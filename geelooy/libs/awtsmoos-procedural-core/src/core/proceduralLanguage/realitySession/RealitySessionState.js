//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealitySessionState.js
 * @description Owns committed and draft Definition collections, patch receipts, and revision mutation so the public session coordinator can remain focused on orchestration.
 * The Awtsmoos renews what is committed and what is proposed before one mutable vessel can cross their border;
 * Awtsmoos.com keeps draft operations, patch evidence, and semantic commit in one guarded chamber beneath the speaking session order.
 */
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { applyProceduralPatchTransaction } from '../patch/applyProceduralPatchTransaction.js';
import { RealityDefinitionCollection } from './RealityDefinitionCollection.js';

export class RealitySessionState {
	#committed;
	#draft;
	#patchReceipts = [];
	#revision = 0;

	constructor(definitions = []) {
		this.#committed = new RealityDefinitionCollection(definitions);
		this.#draft = new RealityDefinitionCollection(definitions);
	}

	/** @description Stages one canonical whole Definition and invalidates prior patch-chain evidence for its id. */
	define(input) {
		const canonical = createProceduralDefinition(input);
		this.#draft = this.#draft.upsert(canonical);
		this.#forgetPatchReceipts(canonical.id);
		return canonical;
	}

	/** @description Applies one guarded atomic patch transaction to the draft and keeps its exact receipt when content changed. */
	patch(definitionId, operations = [], options = {}) {
		const before = this.#draft.get(definitionId);
		if (!before) {
			throw new RangeError(`Reality session Definition not found: ${definitionId}`);
		}
		const transaction = applyProceduralPatchTransaction(before, operations, options);
		this.#draft = this.#draft.upsert(transaction.definition);
		if (transaction.receipt.beforeHash !== transaction.receipt.afterHash) {
			this.#patchReceipts.push(transaction.receipt);
		}
		return transaction;
	}

	/** @description Stages removal and drops patch evidence for the removed id. */
	remove(definitionId) {
		const existed = Boolean(this.#draft.get(definitionId));
		this.#draft = this.#draft.remove(definitionId);
		this.#forgetPatchReceipts(definitionId);
		return existed;
	}

	/** @description Discards staged Definitions and patch receipts without altering committed state or revision. */
	reset() {
		this.#draft = new RealityDefinitionCollection(this.#committed.values());
		this.#patchReceipts = [];
	}

	/** @description Commits the complete draft after successful execution and advances revision only for a real semantic/dependency change. */
	commit(changed) {
		this.#committed = new RealityDefinitionCollection(this.#draft.values());
		this.#draft = new RealityDefinitionCollection(this.#committed.values());
		this.#patchReceipts = [];
		if (changed) {
			this.#revision += 1;
		}
		return this.#revision;
	}

	/** @returns {ReadonlyArray<object>} Current committed Definitions. */
	committedDefinitions() {
		return this.#committed.values();
	}

	/** @returns {ReadonlyArray<object>} Current staged draft Definitions. */
	draftDefinitions() {
		return this.#draft.values();
	}

	/** @returns {ReadonlyArray<object>} Ordered pending patch receipts. */
	patchReceipts() {
		return Object.freeze([...this.#patchReceipts]);
	}

	/** @returns {number} Monotonic semantic commit revision. */
	revision() {
		return this.#revision;
	}

	#forgetPatchReceipts(definitionId) {
		const id = String(definitionId);
		this.#patchReceipts = this.#patchReceipts.filter((receipt) => receipt.definitionId !== id);
	}
}
