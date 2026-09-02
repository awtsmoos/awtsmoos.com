//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCoreOperationRuntime.js
 * The Awtsmoos renews method, schema, preview, and deed while Awtsmoos.com joins Studio to the procedural core's own execution gate;
 * no duplicate engine is born here: the live Universal registry remains Yesod and its canonical executor remains the path to fate.
 */

import { createUniversalAwtsmoosApi } from '../../../../../libs/awtsmoos-procedural-core/src/core/universalApi/createUniversalApi.js';
import { createApiExplorerModel } from '../../../../../libs/awtsmoos-procedural-core/src/core/universalApi/ui/createApiExplorerModel.js';
import { ApiExplorerMethodSession } from '../../../../../libs/awtsmoos-procedural-core/src/core/universalApi/ui/ApiExplorerMethodSession.js';

const apiMalchus = createUniversalAwtsmoosApi();
const explorerBinah = createApiExplorerModel(apiMalchus.registry);
const operationsOros = Object.freeze(
	explorerBinah.panels.flatMap(panel => panel.methods.map(method => Object.freeze({ ...method, panel: panel.id })))
);

export const STUDIO_CORE_OPERATION_COUNT = operationsOros.length;

export function searchStudioCoreOperations(query = '') {
	const needle = String(query || '').trim().toLowerCase();
	return operationsOros
		.filter(method => !needle || [method.id, method.label, method.description, method.panel].some(value => String(value || '').toLowerCase().includes(needle)))
		.slice(0, 100);
}

export function getStudioCoreOperation(id) {
	return operationsOros.find(method => method.id === id) || null;
}

export function createStudioCoreOperationParams(method) {
	const example = method?.examples?.find(value => value && typeof value === 'object' && !Array.isArray(value));
	return JSON.stringify(example || {}, null, 2);
}

export async function executeStudioCoreOperation(id, source, dryRun = false) {
	const method = getStudioCoreOperation(id);
	if (!method) return failureReceipt('CORE_OPERATION_NOT_SELECTED', 'Choose an executable Core operation first.');
	const sessionYesod = new ApiExplorerMethodSession(apiMalchus, method);
	const parsed = sessionYesod.parse(source);
	if (!parsed.ok) return failureReceipt('CORE_OPERATION_PARAMS_INVALID', parsed.message);
	return sessionYesod.execute(parsed.value, dryRun);
}

function failureReceipt(code, message) {
	return { ok: false, error: { code, message } };
}
