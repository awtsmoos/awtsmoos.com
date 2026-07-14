//B"H
//Boruch Hashem
//Blessed is He

/**
 * Active location view composes the complete civic or climax chamber for one inspected
 * road. The Awtsmoos renews person, market, workshop, weather, and guardian together;
 * Awtsmoos.com exposes only sections backed by actual domain state and lawful actions.
 */

import { expeditionBossSection } from './expeditionBossView.js';
import { expeditionCitizenSection } from './expeditionCitizenView.js';
import { expeditionCraftSection } from './expeditionCraftView.js';
import { expeditionMaterialsSection } from './expeditionMaterialsView.js';
import { expeditionShopSection } from './expeditionShopView.js';
import { expeditionWeatherView } from './expeditionWeatherView.js';

export function expeditionActiveLocationSection(snapshot, actions) {
	const location = snapshot.activeLocation;
	if (!location) return null;
	return {
		tag: 'section',
		attrs: { class: `expeditionActiveLocation ${location.kind}` },
		children: compact([
			{
				tag: 'header',
				children: [
					{ tag: 'span', attrs: { class: 'locationKind' }, children: [location.kind] },
					{ tag: 'h3', children: [location.name] },
					{ tag: 'p', children: [location.description] }
				]
			},
			expeditionWeatherView(snapshot),
			expeditionBossSection(snapshot),
			expeditionCitizenSection(snapshot, actions.onCitizen),
			expeditionShopSection(snapshot, actions.onPurchase),
			expeditionCraftSection(snapshot, actions.onCraft),
			expeditionMaterialsSection(snapshot),
			entryButton(location, snapshot, actions.onBegin)
		])
	};
}

function entryButton(location, snapshot, onBegin) {
	const record = snapshot.locations.find(item => item.id === location.id);
	const available = record?.availability.available && Boolean(record.map);
	return {
		tag: 'button',
		attrs: {
			class: 'primaryMenuButton expeditionEnterActive',
			type: 'button',
			disabled: available ? null : true
		},
		on: { click: () => available && onBegin(location.id) },
		children: [location.kind === 'climax' ? 'Challenge Guardian' : 'Enter Authored Road']
	};
}

function compact(values) {
	return values.filter(Boolean);
}
