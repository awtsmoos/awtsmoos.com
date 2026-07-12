/**
 * B"H
 * @module MobilePanelData
 * @description Panel content from authored campaign, party, bag, codex, and gifts.
 */
import { State } from '../../../binah/State.js';
import { campaignMissionRows, campaignMissionSummary } from '../../../missions/MissionJournal.js';
import { routeSummary } from '../../../yesod/abilities/AbilityRuntime.js';
import { bagRows, clothesRows, ensureBag, journalRows } from '../../../yesod/bag/BagRuntime.js';
import { codexRows, codexSummary } from '../../../yesod/codex/TorahCodexRuntime.js';
import { giftRows } from '../../../yesod/rambam/GiftRuntime.js';
import { declarationRows } from '../../../yesod/rambam/DeclarationRuntime.js';
import { finalDeclarationReady } from '../../../yesod/rambam/FinalDeclarationRuntime.js';
import { dexRows, dexLine } from '../../../yesod/musag/MusagDex.js';
import { partyRows } from '../../../yesod/party/PartyRuntime.js';
import { zoneThemeForMap } from '../../../data/concepts/TorahCodexIndex.js';
import { titleCase } from '../MobileUiHelpers.js';

const routeRows = () => routeSummary().map((line, index) => [`Route ${index + 1}`, line]);
const relationshipRows = () => {
	const summary = campaignMissionSummary();
	return [
		['Current chapter', summary.chapter],
		['Current mission', summary.active?.title || 'Main campaign complete'],
		['Current objective', summary.active?.progress || 'Seek optional Musagim and mastery.'],
		['Handmade minutes complete', summary.minutes],
		['How to talk', 'Tap an NPC to face them, then press Talk.']
	];
};

export const panelData = name => {
	ensureBag();
	const zone = zoneThemeForMap(State.MapId);
	if (name === 'menu') {
		const codex = codexSummary();
		return { title: `${State.Story.active}`, intro: `${zone.name}: ${zone.mood}`, rows: [
			...campaignMissionRows(), ['Zuzim', State.Inventory.money || 0], ['Light', `${State.Stats.light}/${State.Stats.maxLight}`],
			['Player Level', State.Stats.level], ['Garment', titleCase(State.Equipment.garment)], ['Musag Dex', dexLine()],
			['Soul Path', `${codex.soul.name} (${codex.soul.category})`], ...routeRows().slice(0, 2)
		] };
	}
	if (name === 'map') return { title: 'Relationship Map', intro: `${zone.name}: ${zone.mood}.`, rows: relationshipRows() };
	if (name === 'journal') return { title: 'Campaign Journal', intro: State.Story.nextStep, rows: [
		...campaignMissionRows(), ...journalRows(), ['— Active Party —', ''], ...partyRows(),
		['— Gift Ledger —', ''], ...giftRows(), ['— Declaration —', ''], ...declarationRows(),
		['— Codex —', ''], ...codexRows(), ['— Musag Dex —', ''], ...dexRows()
	] };
	if (name === 'items') return { title: 'Bag / Gifts', intro: 'Ordinary goods may be traded; entrusted gifts are protected.', rows: [
		...bagRows(), ['Declaration Ready', finalDeclarationReady() ? 'yes' : 'not yet'],
		['— Gifts —', ''], ...giftRows(), ['— Clothes —', ''], ...clothesRows()
	] };
	return null;
};
