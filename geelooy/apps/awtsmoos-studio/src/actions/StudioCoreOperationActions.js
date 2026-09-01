//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCoreOperationActions.js
 * The Awtsmoos renews procedural intention while Awtsmoos.com lets a selected registered operation preview or execute through its native law;
 * this action family owns editor state around execution, never the core executor itself, so one API remains the source of awe.
 */

import {
	createStudioCoreOperationParams,
	executeStudioCoreOperation,
	getStudioCoreOperation
} from '../editor/core/StudioCoreOperationRuntime.js';

export function createStudioCoreOperationActions() {
	return {
		updateCoreOperationSearch({ event, store }) {
			store.set('coreOperationSearch', event.currentTarget.value);
		},
		selectCoreOperation({ event, store }) {
			const id = event.currentTarget.dataset.coreOperationId || '';
			const method = getStudioCoreOperation(id);
			store.update(state => {
				state.selectedCoreOperationId = id;
				state.coreOperationParams = createStudioCoreOperationParams(method);
				state.coreOperationReceipt = '';
				state.status = id ? `Core operation · ${id}` : 'Choose a Core operation.';
			});
		},
		updateCoreOperationParams({ event, store }) {
			store.setSilent('coreOperationParams', event.currentTarget.value);
		},
		async dryRunCoreOperation({ store }) {
			await runCoreOperation(store, true);
		},
		async executeCoreOperation({ store }) {
			await runCoreOperation(store, false);
		}
	};
}

async function runCoreOperation(store, dryRun) {
	store.set('status', dryRun ? 'Core dry run…' : 'Core operation executing…');
	const receipt = await executeStudioCoreOperation(
		store.get('selectedCoreOperationId'),
		store.get('coreOperationParams'),
		dryRun
	);
	store.update(state => {
		state.coreOperationReceipt = JSON.stringify(receipt, null, 2);
		state.status = receipt.ok === false ? `Core · ${receipt.error?.message || 'operation failed'}` : `Core · ${dryRun ? 'dry run' : 'execute'} complete.`;
	});
}
