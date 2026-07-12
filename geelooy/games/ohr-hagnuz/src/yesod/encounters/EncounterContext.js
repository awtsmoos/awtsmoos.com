/** B"H @module EncounterContext - common story and encounter helpers. */
import { State } from '../../binah/State.js';
import { openStoryDialogue } from '../story/OhrStory.js';

export const campaignRegion = () => ({
	Rambam_Garden: 'Garden of Ungiven Things', Hall_Of_Separation: 'Hall of Separation', Levi_Road: 'Road of Levi Songs',
	Poor_Gate: 'Poor Gate', Jerusalem_Ascent: 'Jerusalem Ascent', Orchard_SevenSpecies: 'Orchard of Seven Species',
	Rambam_RecipientCourt: 'Court of Rightful Receivers', Market_Of_Exchange: 'Market of Exchange',
	House_Of_Forgetting: 'House of Forgetting', Sea_Of_Fire: 'Sea of Fire', Final_Declaration: 'Final Declaration',
	Hidden_Orchard: 'Hidden Orchard', Ohr_HaGanuz_Realm: 'Ohr HaGanuz Realm'
}[State.MapId] || State.Story?.region || State.MapId);

export const shouldBattle = meta => Boolean(meta.battle && meta.encounter);
export const openNpcDialogue = (glyph, meta) => openStoryDialogue(glyph, meta.label || 'NPC', meta.quest || null);
export const isPresence = meta => ['npc', 'musag', 'receiver'].includes(meta.kind);
