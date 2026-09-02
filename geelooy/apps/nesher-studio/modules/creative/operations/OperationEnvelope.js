//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file OperationEnvelope.js
 * @description Gives every successful creative mutation one inspectable serializable shape.
 * The Awtsmoos is unchanged whether human hand or AI calls the name;
 * Awtsmoos.com records provenance without granting any operator a different flame.
 */
import { clonePlain } from '../../project/ids.js';

const SOURCES = new Set([
	'human',
	'ai',
	'api',
	'script',
	'macro',
	'preset',
	'automation',
	'remote'
]);

/** Creates one canonical operation record from successful runtime evidence. */
export function createOperationEnvelope(input = {}) {
	return {
		id: createOperationId(),
		commandId: input.definition.id,
		commandVersion: input.definition.version,
		semanticLabel: input.semanticLabel || input.definition.label,
		source: normalizeOperationSource(input.source),
		parameters: clonePlain(input.parameters || {}),
		result: cloneResult(input.result),
		transactionId: input.transactionId || null,
		parentMacroId: input.parentMacroId || null,
		createdAt: new Date().toISOString()
	};
}

/** Restricts provenance to known descriptive values without granting privileges. */
export function normalizeOperationSource(source) {
	return SOURCES.has(source) ? source : 'api';
}

function cloneResult(result) {
	return result === undefined ? null : clonePlain(result);
}

function createOperationId() {
	if (globalThis.crypto?.randomUUID) {
		return `operation-${globalThis.crypto.randomUUID()}`;
	}

	return `operation-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
