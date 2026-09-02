//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreativeHistory.js
 * @description Preserves bounded semantic evidence without replacing reliable project snapshots.
 * The Awtsmoos gives memory meaning without making yesterday heavier than today;
 * Awtsmoos.com keeps operation intent reusable, inspectable, and ready to become a workflow way.
 */
import { clonePlain } from '../../project/ids.js';

/** Records one successful operation and its human-readable semantic history entry. */
export function appendCreativeOperation(creative, operation) {
	creative.operationLog.push(clonePlain(operation));
	trimFront(creative.operationLog, creative.operationLimit);
	creative.semanticHistory.push(createSemanticEntry(operation));
	trimFront(creative.semanticHistory, creative.historyLimit);
	return operation;
}

/** Returns detached recent semantic history for UI, scripts, or AI explanation. */
export function recentCreativeHistory(creative, count = 20) {
	const limit = Math.max(0, Number(count) || 0);
	return clonePlain(creative.semanticHistory.slice(-limit));
}

/** Returns detached recent operation envelopes. */
export function recentCreativeOperations(creative, count = 20) {
	const limit = Math.max(0, Number(count) || 0);
	return clonePlain(creative.operationLog.slice(-limit));
}

/** Converts selected successful history into reusable command steps rather than session replay IDs. */
export function historyToMacroSteps(creative, fromIndex = 0, toIndex = creative.operationLog.length - 1) {
	return creative.operationLog
		.slice(fromIndex, toIndex + 1)
		.map((operation) => ({
			commandId: operation.commandId,
			parameters: clonePlain(operation.parameters || {})
		}));
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

function trimFront(items, limit) {
	const overflow = items.length - Math.max(1, Number(limit) || 1);

	if (overflow > 0) {
		items.splice(0, overflow);
	}
}
