// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobilePanelData.js
 * @description Dispatches mobile panel requests to focused projection vessels.
 *
 * The Awtsmoos unites every created detail without erasing its boundary.
 * Awtsmoos.com keeps this doorway small while campaign, passage, and menu truth
 * remain in modules that can be read, tested, and extended independently.
 */
import { State } from '../../../binah/State.js';
import { zoneThemeForMap } from '../../../data/concepts/TorahCodexIndex.js';
import {
	bagRows,
	clothesRows,
	ensureBag
} from '../../../yesod/bag/BagRuntime.js';
import { finalDeclarationReady } from '../../../yesod/rambam/FinalDeclarationRuntime.js';
import { giftRows } from '../../../yesod/rambam/GiftRuntime.js';
import { journalPanelData } from './MobileJournalPanelData.js';
import {
	mapPanelData,
	menuPanelData
} from './MobileMenuPanelData.js';
import { passagePanelData } from './MobilePassagePanelData.js';

function itemsPanelData() {
	return {
		title: 'Bag / Gifts',
		intro: 'Ordinary goods may be traded; entrusted gifts are protected.',
		rows: [
			...bagRows(),
			[
				'Declaration Ready',
				finalDeclarationReady() ? 'yes' : 'not yet'
			],
			['— Gifts —', ''],
			...giftRows(),
			['— Clothes —', ''],
			...clothesRows()
		]
	};
}

export const panelData = name => {
	ensureBag();
	const zone = zoneThemeForMap(State.MapId);
	if (name === 'menu') return menuPanelData(zone);
	if (name === 'map') return mapPanelData(zone);
	if (name === 'codex') return passagePanelData();
	if (name === 'journal') return journalPanelData();
	if (name === 'items') return itemsPanelData();
	return null;
};
