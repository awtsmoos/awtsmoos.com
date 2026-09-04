//B"H
// Boruch Hashem
// Blessed is He
/**
* @file CommandSuccessRecorder.js
* @description Records successful command evidence while remembering newly created runtime source handles before history closes.
* The Awtsmoos lets a creative deed become memory only after its mutation and living resources truly stand;
* Awtsmoos.com keeps operation evidence, transaction closure, and runtime pruning in one measured hand.
*/
import { syncProjectFromState } from '../../state.js';
import {
	pruneSourceRuntimeResources,
	rememberSourceRuntimeResources
} from '../history/SourceRuntimeResourceLedger.js';
import { appendCreativeOperation } from '../history/CreativeHistory.js';
import { createOperationEnvelope } from '../operations/OperationEnvelope.js';

/** Finalizes one successful command and returns detached execution evidence. */
export function recordCommandSuccess(input = {}) {
	const {
		state,
		definition,
		parameters,
		result,
		options,
		scope
	} = input;
	syncProjectFromState(state);
	const summary = definition.summarizeResult(result);
	const operation = createOperationEnvelope({
		definition,
		parameters,
		result: summary,
		source: options.source,
		transactionId: options.transactionId,
		parentMacroId: options.parentMacroId
	});
	if (definition.mutation === 'canonical') {
		rememberSourceRuntimeResources(state);
		appendCreativeOperation(state.project.creative, operation);
		scope.commit();
		pruneSourceRuntimeResources(state);
	}
	return {
		ok: true,
		noOp: false,
		commandId: definition.id,
		operation,
		result: summary
	};
}
