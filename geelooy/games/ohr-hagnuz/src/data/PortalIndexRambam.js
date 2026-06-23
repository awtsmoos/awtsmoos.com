/**
 * B"H
 * @module PortalIndexRambam
 * @description Full Rambam campaign portal chain from Village to Garden, Court, Merchant, House, Declaration, and postgame.
 *
 * Chapter 316: The roads learned where they are going. The Awtsmoos creates
 * every crossing from nothing every instant, and now the player can actually
 * walk the story spine instead of reading it in a report.
 */
const edge = (fromEdge, to, x, y, message) => ({ edge: fromEdge, to, spawn: { x, y }, message });

export const RambamPortals = {
  Overworld_Main: [edge('E', 'Rambam_Garden', 2, 5, 'Entered the Garden of Ungiven Things.')],
  Village_Beginnings: [edge('E', 'Rambam_Garden', 2, 5, 'Entered the Garden of Ungiven Things.')],
  Rambam_Garden: [
    edge('E', 'Hall_Of_Separation', 2, 3, 'Entered the Hall of Separation.'),
    edge('W', 'Village_Beginnings', 25, 6, 'Returned to the Village of Beginnings.')
  ],
  Hall_Of_Separation: [
    edge('E', 'Levi_Road', 2, 3, 'The Levi Road begins to sing.'),
    edge('W', 'Rambam_Garden', 25, 5, 'Returned to the gift garden.')
  ],
  Levi_Road: [
    edge('E', 'Poor_Gate', 2, 3, 'Arrived at the Poor Gate.'),
    edge('W', 'Hall_Of_Separation', 16, 3, 'Returned to the Hall of Separation.')
  ],
  Poor_Gate: [
    edge('E', 'Jerusalem_Ascent', 2, 4, 'The ascent to Jerusalem opens.'),
    edge('W', 'Levi_Road', 18, 3, 'Returned to the Road of Levi Songs.')
  ],
  Jerusalem_Ascent: [
    edge('E', 'Orchard_SevenSpecies', 2, 5, 'Entered the Orchard of Seven Species.'),
    edge('W', 'Poor_Gate', 18, 4, 'Returned to the Poor Gate.')
  ],
  Orchard_SevenSpecies: [
    edge('E', 'Rambam_RecipientCourt', 2, 6, 'Entered the Court of Rightful Receivers.'),
    edge('W', 'Jerusalem_Ascent', 22, 4, 'Returned to Jerusalem Ascent.')
  ],
  Rambam_RecipientCourt: [
    edge('E', 'Market_Of_Exchange', 2, 5, 'Entered the Market of Exchange.'),
    edge('W', 'Orchard_SevenSpecies', 20, 5, 'Returned to the Orchard.')
  ],
  Market_Of_Exchange: [
    edge('E', 'House_Of_Forgetting', 2, 6, 'Entered the House of Forgetting.'),
    edge('W', 'Rambam_RecipientCourt', 25, 6, 'Returned to the receiver court.')
  ],
  House_Of_Forgetting: [
    edge('E', 'Sea_Of_Fire', 2, 4, 'The Sea of Fire receives what is false.'),
    edge('W', 'Market_Of_Exchange', 24, 5, 'Returned to the Market of Exchange.')
  ],
  Sea_Of_Fire: [
    edge('E', 'Final_Declaration', 2, 3, 'The Final Declaration waits.'),
    edge('W', 'House_Of_Forgetting', 24, 6, 'Returned to the House of Forgetting.')
  ],
  Final_Declaration: [
    edge('E', 'Hidden_Orchard', 2, 3, 'The Hidden Orchard opens after truth.'),
    edge('W', 'Sea_Of_Fire', 20, 4, 'Returned to the Sea of Fire.')
  ],
  Hidden_Orchard: [
    edge('E', 'Ohr_HaGanuz_Realm', 2, 3, 'Entered the Ohr HaGanuz Realm.'),
    edge('W', 'Final_Declaration', 18, 3, 'Returned to the Final Declaration.')
  ],
  Ohr_HaGanuz_Realm: [edge('W', 'Hidden_Orchard', 18, 3, 'Returned to the Hidden Orchard.')]
};
