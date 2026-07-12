/**
 * B"H
 * @module ArrivalRuntime
 * @description Automatic tile arrivals for portals, gifts, books, holy places, and wild encounters.
 */
import { State } from '../../binah/State.js';
import { tileMeta } from '../../data/WorldData.js';
import { encounterById, randomWildEncounter } from '../../data/EncounterIndex.js';
import { tileAt, portalAt, transfer } from '../OhrWorld.js';
import { startDebate } from '../OhrDebate.js';
import { interactQuest } from '../OhrQuest.js';
import { learnBook } from '../books/TorahBooks.js';
import { doMitzvah, healAtSynagogue } from '../holy/HolyPlaces.js';
import { collectGift, giveBestGiftToReceiverGlyph } from '../rambam/GiftRuntime.js';
import { campaignRegion, isPresence, shouldBattle } from './EncounterContext.js';
import { recordInspection } from './EncounterMissionActions.js';

const portalArrival = (glyph, meta) => {
	if (!['door', 'edge'].includes(meta.kind)) return false;
	const portal = portalAt(State.Hero.cx, State.Hero.cy, glyph);
	if (portal) transfer(portal);
	return true;
};

const presenceArrival = (glyph, meta) => {
	if (!isPresence(meta)) return false;
	if (meta.kind === 'receiver') return giveBestGiftToReceiverGlyph(glyph);
	if (meta.kind === 'musag' && shouldBattle(meta)) startDebate(encounterById(meta.encounter));
	else State.say(`${meta.label || 'Guide'} is here. Face them and press Talk.`, 180);
	return true;
};

export const handleTileArrival = () => {
	const glyph = tileAt(State.Hero.cx, State.Hero.cy);
	const meta = tileMeta(glyph);
	if (portalArrival(glyph, meta)) return;
	if (meta.kind === 'gift') { collectGift(meta.gift); recordInspection(meta); if (meta.quest) interactQuest(meta); return; }
	if (meta.book) { recordInspection(meta); if (meta.quest) interactQuest(meta); learnBook(meta.book); return; }
	if (meta.kind === 'synagogue') { if (meta.quest) interactQuest(meta); healAtSynagogue(meta.label); return; }
	if (meta.kind === 'mitzvah') { doMitzvah(meta.label); return; }
	if (meta.questItem) { recordInspection(meta); interactQuest(meta); return; }
	if (presenceArrival(glyph, meta)) return;
	if (meta.kind === 'grass' && Math.random() < (meta.wildChance || 0)) startDebate(randomWildEncounter(campaignRegion()));
};
