/**
 * B"H
 * @module CampaignPortals
 * @description Bidirectional fallback roads for every handcrafted campaign region.
 */
const portal = (edge, to, x, y, message) => ({ edge, to, spawn: { x, y }, message });

export const CampaignPortals = {
	Overworld_Main: [portal('E', 'Rambam_Garden', 2, 5, 'Entered the Garden of Ungiven Things.')],
	Rambam_Garden: [
		portal('W', 'Overworld_Main', 25, 7, 'Returned to the Village of Beginnings.'),
		portal('E', 'Hall_Of_Separation', 2, 3, 'Entered the Hall of Separation.')
	],
	Hall_Of_Separation: [
		portal('W', 'Rambam_Garden', 27, 5, 'Returned to the Garden.'),
		portal('E', 'Levi_Road', 2, 3, 'Entered the Road of Levi Songs.')
	],
	Levi_Road: [
		portal('W', 'Hall_Of_Separation', 17, 3, 'Returned to the Hall of Separation.'),
		portal('E', 'Poor_Gate', 2, 3, 'Entered the Poor Gate.')
	],
	Poor_Gate: [
		portal('W', 'Levi_Road', 19, 3, 'Returned to the Road of Songs.'),
		portal('E', 'Jerusalem_Ascent', 2, 4, 'Began the Jerusalem ascent.')
	],
	Jerusalem_Ascent: [
		portal('W', 'Poor_Gate', 20, 3, 'Returned to the Poor Gate.'),
		portal('E', 'Orchard_SevenSpecies', 2, 3, 'Entered the orchard of seven species.')
	],
	Orchard_SevenSpecies: [
		portal('W', 'Jerusalem_Ascent', 24, 4, 'Returned to the Jerusalem ascent.'),
		portal('E', 'Rambam_RecipientCourt', 2, 4, 'Entered the Court of Rightful Receivers.')
	],
	Rambam_RecipientCourt: [
		portal('W', 'Orchard_SevenSpecies', 21, 3, 'Returned to the orchard.'),
		portal('E', 'Market_Of_Exchange', 2, 3, 'Entered the Market of Exchange.')
	],
	Market_Of_Exchange: [
		portal('W', 'Rambam_RecipientCourt', 27, 4, 'Returned to the Receiver Court.'),
		portal('E', 'House_Of_Forgetting', 2, 4, 'Entered the House of Forgetting.')
	],
	House_Of_Forgetting: [
		portal('W', 'Market_Of_Exchange', 27, 3, 'Returned to the Market of Exchange.'),
		portal('E', 'Sea_Of_Fire', 2, 3, 'Entered the Sea of Fire.')
	],
	Sea_Of_Fire: [
		portal('W', 'House_Of_Forgetting', 27, 4, 'Returned to the House of Forgetting.'),
		portal('E', 'Final_Declaration', 2, 3, 'Entered the Final Declaration.')
	],
	Final_Declaration: [
		portal('W', 'Sea_Of_Fire', 22, 3, 'Returned to the Sea of Fire.'),
		portal('E', 'Ohr_HaGanuz_Realm', 2, 3, 'Entered the revealed realm.')
	],
	Ohr_HaGanuz_Realm: [portal('W', 'Final_Declaration', 19, 3, 'Returned to the chamber of testimony.')]
};

export const campaignPortalsFor = mapId => CampaignPortals[mapId] || [];
