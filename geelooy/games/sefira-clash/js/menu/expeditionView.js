//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expedition view composes atlas, active place, citizens, economy, synchronization,
 * loadout, and journal without owning their laws. The Awtsmoos renews every visible
 * road; Awtsmoos.com receives safe descriptors backed by persisted model operations.
 */

import { reveal } from './domForge.js';
import { expeditionActiveLocationSection } from './expeditionActiveLocationView.js';
import { expeditionGearSection } from './expeditionGearView.js';
import { expeditionQuestSection } from './expeditionQuestView.js';
import { expeditionRegionSections } from './expeditionRegionView.js';
import { expeditionSummaryView } from './expeditionSummaryView.js';
import { expeditionSyncSection } from './expeditionSyncView.js';

export function showExpeditionView(host, config) {
	const snapshot = config.model.expedition.snapshot();
	const actions = {
		onBegin: config.onBeginLocation,
		onInspect: config.onInspectLocation,
		onCitizen: config.onCitizen,
		onPurchase: config.onPurchase,
		onCraft: config.onCraft
	};
	reveal(host, {
		tag: 'section',
		attrs: { class: 'menuPanel expeditionPanel' },
		children: [
			backButton(config.onBack),
			{
				tag: 'p',
				attrs: { class: 'menuEyebrow' },
				children: ['persistent authored 2D world']
			},
			{ tag: 'h2', children: ['Expedition Atlas'] },
			{
				tag: 'p',
				attrs: { class: 'menuPoem' },
				children: [
					'Thirty bespoke roads. Twenty citizens. Named weather, crafting, merchants, ten guardians, optional sync, and authoritative co-op.'
				]
			},
			expeditionSummaryView(snapshot),
			expeditionSyncSection(config.sync, config.onSync),
			expeditionActiveLocationSection(snapshot, actions),
			{ tag: 'h3', children: ['Regions and Roads'] },
			...expeditionRegionSections(snapshot, actions),
			expeditionGearSection(snapshot, config.onEquip),
			expeditionQuestSection(snapshot, config.onQuest)
		]
	});
}

function backButton(onBack) {
	return {
		tag: 'button',
		attrs: { class: 'backMenuButton', type: 'button' },
		on: { click: onBack },
		children: ['← Main Gates']
	};
}
