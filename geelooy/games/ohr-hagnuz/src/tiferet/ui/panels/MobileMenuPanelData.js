// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileMenuPanelData.js
 * @description Projects the current campaign, resources, soul path, and relationship map.
 *
 * The Awtsmoos renews every relationship without reducing it to a menu row.
 * Awtsmoos.com uses this small vessel only to make the living world navigable.
 */
import { State } from '../../../binah/State.js';
import {
	campaignMissionRows,
	campaignMissionSummary
} from '../../../missions/MissionJournal.js';
import { routeSummary } from '../../../yesod/abilities/AbilityRuntime.js';
import { codexSummary } from '../../../yesod/codex/TorahCodexRuntime.js';
import { dexLine } from '../../../yesod/musag/MusagDex.js';
import { titleCase } from '../MobileUiHelpers.js';

const routeRows = () => routeSummary().map((line, index) => [
	`Route ${index + 1}`,
	line
]);

export function menuPanelData(zone) {
	const codex = codexSummary();
	return {
		title: `${State.Story.active}`,
		intro: `${zone.name}: ${zone.mood}`,
		rows: [
			...campaignMissionRows(),
			['Zuzim', State.Inventory.money || 0],
			['Light', `${State.Stats.light}/${State.Stats.maxLight}`],
			['Player Level', State.Stats.level],
			['Garment', titleCase(State.Equipment.garment)],
			['Musag Dex', dexLine()],
			['Soul Path', `${codex.soul.name} (${codex.soul.category})`],
			...routeRows().slice(0, 2)
		]
	};
}

export function mapPanelData(zone) {
	const summary = campaignMissionSummary();
	return {
		title: 'Relationship Map',
		intro: `${zone.name}: ${zone.mood}.`,
		rows: [
			['Current chapter', summary.chapter],
			['Current mission', summary.active?.title || 'Main campaign complete'],
			['Current objective', summary.active?.progress || 'Seek optional Musagim and mastery.'],
			['Handmade minutes complete', summary.minutes],
			['How to talk', 'Tap an NPC to face them, then press Talk.']
		]
	};
}
