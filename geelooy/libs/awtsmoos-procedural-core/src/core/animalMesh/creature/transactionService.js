// B"H
// Boruch Hashem
// Blessed is He

import { cloneCreatureValue } from "./clone.js";
import { refreshBriahCreature } from "./documents.js";
import { validateBriahCreature } from "./validation.js";
import { compileCreatureArtifacts } from "./artifactCompiler.js";

export function beginCreatureTransaction(store, artifactId) {
	const record = store.requireRecord(artifactId);
	const transactionId = store.nextId("creature-transaction", [artifactId, record.document.revision]);
	const transaction = {
		transactionId,
		artifactId,
		baseRevision: record.document.revision,
		draft: cloneCreatureValue(record.document),
		operations: [],
		status: "open"
	};
	store.transactions.set(transactionId, transaction);
	return {
		transactionId,
		artifactId,
		baseRevision: transaction.baseRevision,
		status: transaction.status
	};
}

export function previewCreatureTransaction(store, transactionId, options = {}) {
	const transaction = store.requireTransaction(transactionId);
	const record = store.requireRecord(transaction.artifactId);
	const previewDocument = refreshBriahCreature(transaction.draft, false);
	const priorRig = record.compiled?.yetzirahRig || record.previousCompiled?.yetzirahRig || null;
	return {
		transactionId,
		document: previewDocument,
		compiled: compileCreatureArtifacts(previewDocument, { ...options, previousRig: priorRig })
	};
}

export function validateCreatureTransaction(store, transactionId) {
	const transaction = store.requireTransaction(transactionId);
	return {
		transactionId,
		diagnostics: validateBriahCreature(transaction.draft),
		operationCount: transaction.operations.length
	};
}

/**
 * Commits one isolated transaction as exactly one Briah revision. The prior
 * compiled rig remains available as Yetzirah lineage evidence after morphology
 * changes, while every Asiyah artifact is invalidated and deterministically rebuilt.
 */
export function commitCreatureTransaction(store, transactionId) {
	const transaction = store.requireTransaction(transactionId);
	const record = store.requireRecord(transaction.artifactId);
	const previous = cloneCreatureValue(record.document);
	const next = refreshBriahCreature(transaction.draft);
	record.undoStack.push(previous);
	record.redoStack = [];
	record.document = next;
	if (record.compiled) {
		record.previousCompiled = record.compiled;
	}
	record.compiled = null;
	record.history.push({
		type: "transaction",
		transactionId,
		operations: cloneCreatureValue(transaction.operations),
		resultingRevision: next.revision,
		contentHash: next.contentHash
	});
	transaction.status = "committed";
	store.transactions.delete(transactionId);
	return {
		transactionId,
		artifactId: record.artifactId,
		revision: next.revision,
		contentHash: next.contentHash,
		operationCount: transaction.operations.length
	};
}

export function rollbackCreatureTransaction(store, transactionId) {
	const transaction = store.requireTransaction(transactionId);
	transaction.status = "rolled-back";
	store.transactions.delete(transactionId);
	return {
		transactionId,
		artifactId: transaction.artifactId,
		rolledBack: true,
		operationCount: transaction.operations.length
	};
}
