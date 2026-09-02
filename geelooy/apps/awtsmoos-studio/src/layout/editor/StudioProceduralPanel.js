//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioProceduralPanel.js
 * The Awtsmoos renews thousands of procedural names while Awtsmoos.com joins complete discovery with executable Universal Core operations;
 * the maker can search the full public symbol sky, then enter the registered command gate when an operation should become manifestation.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import {
	STUDIO_CORE_SYMBOL_COUNT,
	STUDIO_MOVIE_KIND_COUNT,
	describeStudioCapabilityGroups,
	searchStudioCapabilities
} from '../../editor/StudioCapabilityCatalog.js';
import { createStudioCoreOperationPanel } from './StudioCoreOperationPanel.js';

/** Build the complete Procedural Core drawer: executable registry above, full export discovery below. */
export function createStudioProceduralPanel() {
	const result = {
		tag: 'button',
		class: 'studio-capability-row',
		'data-capability-id': context => context.data.item.id,
		'aria-pressed': context => String(context.store.get('selectedCapability') === context.data.item.id),
		$on: { click: 'selectCoreCapability' },
		children: [
			{ tag: 'strong', text: context => context.data.item.label },
			{ tag: 'span', text: context => context.data.item.category }
		]
	};
	return UI.div(
		{ class: 'studio-editor-panel-content' },
		UI.div(
			{ class: 'studio-panel-heading' },
			UI.strong({ text: 'Procedural Core' }),
			UI.span({ text: `${STUDIO_CORE_SYMBOL_COUNT.toLocaleString()} public symbols` })
		),
		UI.p({
			class: 'studio-panel-help',
			text: `${STUDIO_MOVIE_KIND_COUNT} movie kinds · live Universal execution · complete public Core discovery.`
		}),
		createStudioCoreOperationPanel(),
		UI.div({ class: 'studio-core-discovery-heading' }, UI.strong({ text: 'Complete Core Discovery' })),
		UI.input({
			class: 'studio-panel-search',
			value: context => context.store.get('capabilitySearch'),
			placeholder: 'Search all 1,683 public Core symbols…',
			'aria-label': 'Search all procedural Core capabilities',
			$on: { input: 'updateCapabilitySearch' }
		}),
		UI.div(
			{ class: 'studio-capability-groups' },
			...describeStudioCapabilityGroups().map(group => UI.span({ class: 'studio-capability-group', text: `${group.id} ${group.count}` }))
		),
		UI.div({ class: 'studio-capability-list' }, { ...result, $each: { items: context => searchStudioCapabilities(context.store.get('capabilitySearch')) } })
	);
}
