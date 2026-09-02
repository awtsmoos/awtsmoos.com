//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCoreOperationPanel.js
 * The Awtsmoos renews registered procedural intention while Awtsmoos.com lets expert methods preview and execute through the Core's own Universal API;
 * metadata is the keli, command execution is the ohr, and no alternate engine is invented beside the canonical sky.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import {
	STUDIO_CORE_OPERATION_COUNT,
	searchStudioCoreOperations
} from '../../editor/core/StudioCoreOperationRuntime.js';

/** Build the executable registry lab backed by live Universal API method metadata. */
export function createStudioCoreOperationPanel() {
	const operationRow = {
		tag: 'button',
		class: 'studio-core-operation-row',
		'data-core-operation-id': context => context.data.item.id,
		'aria-pressed': context => String(context.store.get('selectedCoreOperationId') === context.data.item.id),
		$on: { click: 'selectCoreOperation' },
		children: [
			{ tag: 'strong', text: context => context.data.item.label },
			{ tag: 'span', text: context => `${context.data.item.panel} · ${context.data.item.stability}` }
		]
	};
	return UI.section(
		{ class: 'studio-core-operation-lab' },
		UI.div(
			{ class: 'studio-inspector-section-title' },
			UI.strong({ text: 'Executable Core Lab' }),
			UI.span({ text: `${STUDIO_CORE_OPERATION_COUNT} registered operations` })
		),
		UI.input({
			class: 'studio-core-operation-search',
			value: context => context.store.get('coreOperationSearch'),
			placeholder: 'Search executable Core operations…',
			'aria-label': 'Search executable procedural Core operations',
			$on: { input: 'updateCoreOperationSearch' }
		}),
		UI.div(
			{ class: 'studio-core-operation-list' },
			{ ...operationRow, $each: { items: context => searchStudioCoreOperations(context.store.get('coreOperationSearch')) } }
		),
		UI.textarea({
			class: 'studio-core-operation-params',
			value: context => context.store.get('coreOperationParams'),
			'aria-label': 'Core operation JSON parameters',
			$on: { input: 'updateCoreOperationParams' }
		}),
		UI.div(
			{ class: 'studio-panel-action-row' },
			UI.button({ class: 'studio-secondary-button', text: 'Dry Run', $on: { click: 'dryRunCoreOperation' } }),
			UI.button({ class: 'studio-primary-compact-button', text: 'Execute', $on: { click: 'executeCoreOperation' } })
		),
		UI.div({
			class: 'studio-core-operation-receipt',
			text: context => context.store.get('coreOperationReceipt') || 'Choose an operation to inspect parameters, then Dry Run before execution.'
		})
	);
}
