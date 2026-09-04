//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreativeHistory.js
 * @description Preserves bounded semantic evidence beside undo snapshots without making history recursively heavy.
 * The Awtsmoos gives memory meaning while each instant is still renewed and free;
 * Awtsmoos.com keeps successful operations reusable so yesterday can become tomorrow's macro tree.
 */
import { clonePlain } from '../../project/ids.js';

/**
 * Records one successful operation and its human-readable semantic history entry.
 * @param {object} creative Canonical creative project branch.
 * @param {object} operation JSON-safe operation envelope.
 * @returns {object} The same operation for orchestration continuity.
 */
export function appendCreativeOperation(creative, operation) {
	creative.operationLog.push(clonePlain(operation));
	trimFront(creative.operationLog, creative.operationLimit);
	creative.semanticHistory.push(createSemanticEntry(operation));
	trimFront(creative.semanticHistory, creative.historyLimit);
	return operation;
}

/** Returns detached recent semantic history for UI, script, or AI explanation. */
export function recentCreativeHistory(creative, count = 20) {
	const limit = normalizeCount(count);
	return clonePlain(creative.semanticHistory.slice(-limit));
}

/** Returns detached recent operation envelopes. */
export function recentCreativeOperations(creative, count = 20) {
	const limit = normalizeCount(count);
	return clonePlain(creative.operationLog.slice(-limit));
}

/**
 * Converts successful operation history into declarative reusable macro steps.
 * @param {object} creative Canonical creative branch.
 * @param {number} fromIndex Inclusive starting operation index.
 * @param {number} toIndex Inclusive ending operation index.
 * @returns {Array<object>} Command steps with detached parameters.
 */
export function historyToMacroSteps(
	creative,
	fromIndex = 0,
	toIndex = creative.operationLog.length - 1
) {
	return creative.operationLog
		.slice(fromIndex, toIndex + 1)
		.map((operation) => {
			return {
				commandId: operation.commandId,
				parameters: clonePlain(operation.parameters || {})
			};
		});
}

function createSemanticEntry(operation) {
	return {
		id: `history-${operation.id}`,
		operationId: operation.id,
		transactionId: operation.transactionId,
		label: operation.semanticLabel,
		commandId: operation.commandId,
		source: operation.source,
		createdAt: operation.createdAt
	};
}

function normalizeCount(count) {
	return Math.max(0, Number(count) || 0);
}

function trimFront(items, limit) {
	const overflow = items.length - Math.max(1, Number(limit) || 1);

	if (overflow > 0) {
		items.splice(0, overflow);
	}
}
