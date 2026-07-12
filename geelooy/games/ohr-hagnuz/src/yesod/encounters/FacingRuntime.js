/**
 * B"H
 * @module FacingRuntime
 * @description Deliberate face-and-action interactions for missions and RPG systems.
 */
import { State } from '../../binah/State.js';
import { tileMeta } from '../../data/WorldData.js';
import { encounterById } from '../../data/EncounterIndex.js';
import { routeSummary } from '../abilities/AbilityRuntime.js';
import { learnBook } from '../books/TorahBooks.js';
import { openShop } from '../economy/ShopRuntime.js';
import { doMitzvah, healAtSynagogue } from '../holy/HolyPlaces.js';
import { portalAt, transfer } from '../OhrWorld.js';
import { startDebate } from '../OhrDebate.js';
import { interactQuest } from '../OhrQuest.js';
import { collectGift, giveBestGiftToReceiverGlyph } from '../rambam/GiftRuntime.js';
import { grantSkillExp } from '../skills/SkillRuntime.js';
import { openNpcDialogue, shouldBattle } from './EncounterContext.js';
import { recordDelivery, recordInspection, recordTalk, tryGatherObjective, tryNarrativeDelivery } from './EncounterMissionActions.js';
import { handleSpecialMapAction } from './SpecialMapRuntime.js';

const practiceTorahRoute = meta => {
	const routes = routeSummary();
	const route = routes[State.Stats.debatesWon % Math.max(1, routes.length)] || 'Mishnah: Judge Favorably';
	State.Stats.light = Math.min(State.Stats.maxLight, State.Stats.light + 2);
	grantSkillExp('learning', 3, 'route review');
	State.say(`Reviewed route: ${route}. +2 light.${meta.kind === 'road' ? ' Walk east to continue.' : ''}`, 260);
};

const deliveredGiftId = before => Object.keys(State.Gifts?.given || {})
	.find(id => State.Gifts.given[id] > (before[id] || 0));

const handleReceiver = (glyph, meta) => {
	const before = { ...(State.Gifts?.given || {}) };
	const handled = giveBestGiftToReceiverGlyph(glyph);
	const target = deliveredGiftId(before);
	if (target) recordDelivery(target);
	if (!handled) tryNarrativeDelivery(glyph, meta);
	return handled;
};

const handlePresence = (glyph, meta) => {
	recordTalk(glyph);
	if (tryNarrativeDelivery(glyph, meta)) return true;
	if (meta.shop || meta.role === 'merchant') {
		return openShop(State.MapId === 'Overworld_Main' ? 'village_general' : 'merchant_exchange');
	}
	if (shouldBattle(meta)) return startDebate(encounterById(meta.encounter));
	openNpcDialogue(glyph, meta);
	if (meta.quest) interactQuest(meta);
	return true;
};

export const handleFacingAction = front => {
	const meta = tileMeta(front.tile);
	if (handleSpecialMapAction(front, meta) || tryGatherObjective(meta)) return;
	if (meta.kind === 'gift') { collectGift(meta.gift); recordInspection(meta); return; }
	if (meta.kind === 'receiver') return handleReceiver(front.tile, meta);
	if (meta.kind === 'door') {
		const portal = portalAt(front.x, front.y, front.tile);
		if (portal) transfer(portal); else State.say(`${meta.label || 'Door'} is closed for now.`, 220);
		return;
	}
	if (['npc', 'musag'].includes(meta.kind)) return handlePresence(front.tile, meta);
	if (meta.quest || meta.questItem) { recordInspection(meta); if (meta.quest) interactQuest(meta); return; }
	if (meta.kind === 'object') {
		recordInspection(meta);
		if (meta.book) learnBook(meta.book); else State.say(`${meta.label}: its letters glow softly.`, 360);
		return;
	}
	if (meta.kind === 'synagogue') return healAtSynagogue(meta.label);
	if (meta.kind === 'mitzvah') return doMitzvah(meta.label);
	practiceTorahRoute(meta);
};
