// B"H

import { evaluateResourceBudget } from "../budgets/index.js";
import { hashCanonicalValue, serializeCanonicalValue } from "../canonical/index.js";
import { createDiagnostic } from "../diagnostics/index.js";
import { applyDataPatch, normalizeJsonData } from "../patches/index.js";
import { createTransaction } from "./createTransaction.js";

function measureUsage(transaction, document) {
	const operations = transaction.patches.reduce((total, patch) => (
		total + patch.operations.length
	), 0);
	const bytes = new TextEncoder().encode(serializeCanonicalValue(document)).byteLength;
	return Object.freeze({ operations, bytes });
}

function rollback(transaction, baseDocument, baseHash, error, resourceReport) {
	const reason = error instanceof Error ? error.message : String(error);
	const diagnostic = createDiagnostic({
		code: "TRANSACTION.ROLLED_BACK",
		message: "Transaction failed before commit and was rolled back.",
		metadata: { reason, transactionId: transaction.id }
	});
	return Object.freeze({
		state: "rolled_back",
		transaction,
		document: baseDocument,
		baseHash,
		resultHash: baseHash,
		resourceReport,
		diagnostics: Object.freeze([diagnostic])
	});
}

/**
 * Executes every patch against a private base and commits only once. Beneath
 * the changing procession, the old document returns untouched if one gate fails.
 */
export function executeTransaction(baseDocumentInput, transactionInput) {
	const baseDocument = normalizeJsonData(baseDocumentInput);
	const baseHash = hashCanonicalValue(baseDocument);
	let transaction;
	let resourceReport = null;
	try {
		transaction = createTransaction(transactionInput);
		if (transaction.expectedBaseHash !== baseHash) {
			throw new Error("Transaction base hash does not match current document.");
		}
		let document = baseDocument;
		for (const patch of transaction.patches) {
			document = applyDataPatch(document, patch).document;
		}
		resourceReport = evaluateResourceBudget(
			transaction.resourceBudget,
			measureUsage(transaction, document)
		);
		if (!resourceReport.ok) throw new Error("Transaction resource budget was exceeded.");
		return Object.freeze({
			state: "committed",
			transaction,
			document,
			baseHash,
			resultHash: hashCanonicalValue(document),
			resourceReport,
			diagnostics: Object.freeze([])
		});
	} catch (error) {
		if (!transaction) throw error;
		return rollback(transaction, baseDocument, baseHash, error, resourceReport);
	}
}
