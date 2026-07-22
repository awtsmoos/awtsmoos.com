// B"H
// Boruch Hashem
// Blessed is He

import { CreatureKernelStore } from "./kernelStore.js";
import { createCreatureOperationCatalog } from "./operationCatalog.js";
import { TRANSACTION_OPERATIONS, DOCUMENT_OPERATIONS } from "./operationNames.js";
import { applyKernelMutation } from "./kernelMutation.js";
import { isCreatureMutation } from "./mutationDispatcher.js";
import { dispatchTransactionOperation } from "./transactionDispatcher.js";
import { dispatchDocumentOperation } from "./documentDispatcher.js";
import { dispatchDerivedOperation } from "./derivedDispatcher.js";
import { CreatureOperationError } from "./contracts.js";

/**
 * Local API-driven creature-construction kernel integrated inside animalMesh.
 * It is neither HTTP service nor replacement generator: invoke() coordinates the
 * existing library's semantic anatomy with Four-Worlds compilation and the
 * procedural-object principles of stable identity, operations, and transactions.
 */
export class CreatureKernel {
	constructor(options = {}) {
		this.store = options.store || new CreatureKernelStore();
		this.catalog = options.catalog || createCreatureOperationCatalog();
	}

	/**
	 * Invokes one versioned semantic creature operation.
	 * @param {Object} request - Operation, version, target, transaction, and arguments.
	 * @returns {Promise<Object>} Structured operation output.
	 * @complexity Declared by the inspected operation contract.
	 * @deterministic Equal state and arguments yield equal semantic and derived data.
	 * @sideEffects Only those listed by the operation contract.
	 * @throws {CreatureOperationError} For unknown versions, operations, targets, or invalid data.
	 */
	async invoke(request = {}) {
		const definition = this.catalog.get(request.operation);
		if (!definition) {
			throw new CreatureOperationError("CREATURE_OPERATION_UNKNOWN", `Unknown creature operation: ${request.operation}`);
		}
		const version = request.version || "1.0.0";
		if (version !== definition.version) {
			throw new CreatureOperationError("CREATURE_OPERATION_VERSION_UNSUPPORTED", `Unsupported ${request.operation} version: ${version}`);
		}
		const normalizedRequest = { ...request, version, arguments: request.arguments || {} };
		if (TRANSACTION_OPERATIONS.includes(request.operation)) {
			return dispatchTransactionOperation(this, normalizedRequest);
		}
		if (isCreatureMutation(request.operation)) {
			return applyKernelMutation(this.store, normalizedRequest);
		}
		if (DOCUMENT_OPERATIONS.includes(request.operation) && !["creature.compile", "creature.export"].includes(request.operation)) {
			return dispatchDocumentOperation(this, normalizedRequest);
		}
		return dispatchDerivedOperation(this.store, normalizedRequest);
	}
}

export function createCreatureKernel(options = {}) {
	return new CreatureKernel(options);
}
