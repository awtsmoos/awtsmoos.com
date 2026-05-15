/** B"H * @module PortalIndexMidgame */
export const MidgamePortals = {
  Academy_Upper: [
    { x: 10, y: 6, glyph: 'ח', to: 'Chamber_Eit', spawn: { x: 7, y: 6 }, message: 'You enter the chamber of right timing.' }
  ],
  Chamber_Eit: [
    { x: 7, y: 6, glyph: 'ח', to: 'Academy_Upper', spawn: { x: 10, y: 6 }, message: 'You descend from the chamber of eit.' }
  ],
  Market_West: [
    { edge: 'N', to: 'Letter_Forge', spawn: { x: 8, y: 5 }, message: 'The road rises into the forge of letters.' }
  ],
  Letter_Forge: [
    { x: 8, y: 5, glyph: 'ח', to: 'Market_West', spawn: { x: 10, y: 1 }, message: 'You leave the forge for the market road.' }
  ],
  Orchard_Deep: [
    { edge: 'S', to: 'Niggun_Bridge', spawn: { x: 9, y: 1 }, message: 'The orchard path becomes a singing bridge.' }
  ],
  Niggun_Bridge: [
    { edge: 'N', to: 'Orchard_Upper', spawn: { x: 9, y: 5 }, message: 'The bridge carries you into the upper orchard.' },
    { edge: 'W', to: 'Orchard_Deep', spawn: { x: 26, y: 5 }, message: 'You return to the deep orchard.' },
    { edge: 'E', to: 'River_East', spawn: { x: 1, y: 5 }, message: 'The song carries you back to the river.' }
  ],
  Orchard_Upper: [
    { edge: 'S', to: 'Orchard_Deep', spawn: { x: 14, y: 1 }, message: 'You descend from the upper orchard.' },
    { edge: 'W', to: 'Niggun_Bridge', spawn: { x: 1, y: 3 }, message: 'You step onto the bridge of song.' },
    { edge: 'E', to: 'Ruins_Lower', spawn: { x: 1, y: 5 }, message: 'The orchard opens toward old ruins.' }
  ]
};
