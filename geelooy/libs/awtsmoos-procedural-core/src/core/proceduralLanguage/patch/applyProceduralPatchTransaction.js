//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file applyProceduralPatchTransaction.js
 * @description Applies guarded surgical edits atomically, preserves true no-op identity, advances revision once for real change, and returns canonical truth with deterministic consequence evidence.
 * The Awtsmoos renews the whole in one instant while many finite edits appear in ordered procession;
 * Awtsmoos.com lets a transaction fail before revelation, remain still when empty, or commit as one new definition.
 */

import { cloneLanguageValue } from '../data/freezeLanguageValue.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { applyProceduralPatchMutation } from './applyProceduralPatchMutation.js';
import { createProceduralPatchOperation } from './createProceduralPatchOperation.js';
import { assertProceduralPatchGuards } from './ProceduralPatchGuards.js';
import { createProceduralPatchReceipt } from './createProceduralPatchReceipt.js';

/**
 * @description Applies all normalized operations to a private draft after revision and value guards succeed, canonicalizing exactly once when real operations exist.
 * @param {object|string} chochmahInput Base definition data, JSON text, or fluent wrapper.
 * @param {Array<object>} [gevurahPatches=[]] Ordered portable patch operation inputs.
 * @param {object} [binahOptions={}] Optional expectedRevision, reason, metadata, and explicit affected artifact channels.
 * @returns {Readonly<{definition: object, receipt: object}>} Atomic canonical result and immutable change receipt.
 * @throws {Error} When revision guards, value guards, path rules, or operation-specific requirements fail; no caller-visible mutation occurs.
 */
export function applyProceduralPatchTransaction(
	chochmahInput,
	gevurahPatches = [],
	binahOptions = {}
) {
	const tiferesBefore = createProceduralDefinition(chochmahInput);
	assertRevision(tiferesBefore, binahOptions.expectedRevision);
	const netzachOperations = Object.freeze(
		gevurahPatches.map((patch, index) => createProceduralPatchOperation(patch, index))
	);
	if (!netzachOperations.length) {
		return createTransactionResult(
			tiferesBefore,
			tiferesBefore,
			netzachOperations,
			binahOptions
		);
	}
	const malchusDraft = cloneLanguageValue(tiferesBefore);
	for (const gevurahPatch of netzachOperations) {
		assertProceduralPatchGuards(malchusDraft, gevurahPatch);
		applyProceduralPatchMutation(malchusDraft, gevurahPatch);
	}
	malchusDraft.revision = tiferesBefore.revision + 1;
	const tiferesAfter = createProceduralDefinition(malchusDraft);
	return createTransactionResult(
		tiferesBefore,
		tiferesAfter,
		netzachOperations,
		binahOptions
	);
}

/** @private */
function createTransactionResult(before, after, operations, options) {
	return Object.freeze({
		definition: after,
		receipt: createProceduralPatchReceipt(before, after, operations, options)
	});
}

/** @private */
function assertRevision(definition, expectedRevision) {
	if (expectedRevision === undefined) return;
	if (definition.revision === Number(expectedRevision)) return;
	const gevurahError = new Error(
		`B"H | Procedural revision mismatch: expected ${expectedRevision}, received ${definition.revision}`
	);
	gevurahError.code = 'PROCEDURAL_REVISION_MISMATCH';
	gevurahError.expectedRevision = Number(expectedRevision);
	gevurahError.actualRevision = definition.revision;
	throw gevurahError;
}
