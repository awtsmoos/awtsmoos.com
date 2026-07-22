// B"H
// Boruch Hashem
// Blessed is He

import { cloneCreatureValue } from "./clone.js";
import { refreshBriahCreature } from "./documents.js";
import { applyCreatureMutation } from "./mutationDispatcher.js";

function historyOperation(request) {
	return {
		operation: request.operation,
		version: request.version || "1.0.0",
		arguments: cloneCreatureValue(request.arguments || {})
	};
}

function invalidateCompiledArtifacts(record) {
	if (record.compiled) {
		record.previousCompiled = record.compiled;
	}
	record.compiled = null;
}

/**
 * Applies one semantic edit through the shared mutation seam. Direct edits become
 * one-revision commits; transaction edits remain isolated drafts until Malchus-like
 * commitment gives them concrete history, undo, and replay consequences.
 * @param {import("./kernelStore.js").CreatureKernelStore} store - Kernel state store.
 * @param {Object} request - Semantic operation request.
 * @returns {Object} Mutation result and revision evidence.
 */
export function applyKernelMutation(store, request) {
	if (request.transactionId) {
		const transaction = store.requireTransaction(request.transactionId);
		const result = applyCreatureMutation(transaction.draft, request.operation, request.arguments || {});
		transaction.operations.push(historyOperation(request));
		return {
			...result,
			transactionId: transaction.transactionId,
			staged: true,
			stagedOperationCount: transaction.operations.length
		};
	}
	const record = store.requireRecord(request.target?.artifactId);
	const previous = cloneCreatureValue(record.document);
	const draft = cloneCreatureValue(record.document);
	const result = applyCreatureMutation(draft, request.operation, request.arguments || {});
	const next = refreshBriahCreature(draft);
	record.undoStack.push(previous);
	record.redoStack = [];
	record.document = next;
	invalidateCompiledArtifacts(record);
	record.history.push({
		type: "operation",
		operations: [historyOperation(request)],
		resultingRevision: next.revision,
		contentHash: next.contentHash
	});
	return {
		...result,
		artifactId: record.artifactId,
		revision: next.revision,
		contentHash: next.contentHash,
		staged: false
	};
}
