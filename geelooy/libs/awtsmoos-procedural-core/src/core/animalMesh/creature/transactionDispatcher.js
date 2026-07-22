// B"H
// Boruch Hashem
// Blessed is He

import {
	beginCreatureTransaction,
	commitCreatureTransaction,
	previewCreatureTransaction,
	rollbackCreatureTransaction,
	validateCreatureTransaction
} from "./transactionService.js";
import { CreatureOperationError } from "./contracts.js";

/**
 * Routes transaction operations. Staging re-enters the same public invoke seam,
 * ensuring previews, commits, replay, and direct edits never acquire divergent
 * semantics. Rollback discards the isolated vessel without touching Briah truth.
 * @param {Object} kernel - CreatureKernel instance.
 * @param {Object} request - Transaction request.
 * @returns {Promise<Object>} Transaction result.
 */
export async function dispatchTransactionOperation(kernel, request) {
	if (request.operation === "transaction.begin") {
		return beginCreatureTransaction(kernel.store, request.target?.artifactId);
	}
	if (request.operation === "transaction.stage") {
		const stagedRequest = request.arguments?.request;
		if (!stagedRequest?.operation) {
			throw new CreatureOperationError("CREATURE_ARGUMENT_INVALID", "transaction.stage requires arguments.request.operation.");
		}
		const transaction = kernel.store.requireTransaction(request.transactionId);
		return kernel.invoke({
			...stagedRequest,
			transactionId: request.transactionId,
			target: stagedRequest.target || { artifactId: transaction.artifactId }
		});
	}
	if (request.operation === "transaction.preview") {
		return previewCreatureTransaction(kernel.store, request.transactionId, request.arguments || {});
	}
	if (request.operation === "transaction.validate") {
		return validateCreatureTransaction(kernel.store, request.transactionId);
	}
	if (request.operation === "transaction.commit") {
		return commitCreatureTransaction(kernel.store, request.transactionId);
	}
	if (request.operation === "transaction.rollback") {
		return rollbackCreatureTransaction(kernel.store, request.transactionId);
	}
	throw new CreatureOperationError("CREATURE_TRANSACTION_OPERATION_UNKNOWN", `Unsupported transaction operation: ${request.operation}`);
}
