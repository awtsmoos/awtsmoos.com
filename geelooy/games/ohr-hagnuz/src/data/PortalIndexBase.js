/**
 * B"H
 * @module PortalIndexBase
 * Original core door and edge links.
 */
export const BasePortals = {
  Overworld_Main: [
    { x: 5, y: 5, glyph: 'ד', to: 'House_Aleph', spawn: { x: 6, y: 5 }, message: 'You enter the warm house of learning.' },
    { x: 22, y: 5, glyph: 'ה', to: 'Beis_Midrash', spawn: { x: 7, y: 5 }, message: 'The beis midrash opens with a hum of learning.' },
    { x: 5, y: 12, glyph: 'ז', to: 'Garden_South', spawn: { x: 22, y: 10 }, message: 'A garden gate swings open.' },
    { edge: 'N', to: 'Forest_North', spawn: { x: 14, y: 14 }, message: 'You cross into the northern forest of hidden musagim.' },
    { edge: 'E', to: 'Forest_East', spawn: { x: 1, y: 6 }, message: 'You travel east into a wider wild region.' },
    { edge: 'W', to: 'Forest_East', spawn: { x: 26, y: 6 }, message: 'You circle around through the western trail.' },
    { edge: 'S', to: 'Garden_South', spawn: { x: 14, y: 1 }, message: 'You descend into the southern garden.' }
  ],
  House_Aleph: [
    { x: 6, y: 5, glyph: 'ד', to: 'Overworld_Main', spawn: { x: 5, y: 6 }, message: 'You step back into the village.' }
  ],
  Beis_Midrash: [
    { x: 7, y: 5, glyph: 'ה', to: 'Overworld_Main', spawn: { x: 22, y: 6 }, message: 'You leave the beis midrash with clearer vessels.' }
  ],
  Forest_North: [
    { edge: 'S', to: 'Overworld_Main', spawn: { x: 14, y: 1 }, message: 'You return from the northern forest.' },
    { edge: 'N', to: 'Overworld_Main', spawn: { x: 14, y: 14 }, message: 'The forest folds you back toward the village.' },
    { edge: 'E', to: 'Forest_East', spawn: { x: 1, y: 6 }, message: 'The trees open into the eastern expanse.' },
    { edge: 'W', to: 'Overworld_Main', spawn: { x: 1, y: 8 }, message: 'You emerge near the village west road.' }
  ],
  Forest_East: [
    { edge: 'W', to: 'Overworld_Main', spawn: { x: 26, y: 8 }, message: 'You return to the eastern village road.' },
    { edge: 'E', to: 'Forest_North', spawn: { x: 1, y: 8 }, message: 'The eastern path bends northward.' }
  ],
  Garden_South: [
    { x: 22, y: 10, glyph: 'ז', to: 'Overworld_Main', spawn: { x: 5, y: 13 }, message: 'You return through the garden gate.' },
    { x: 5, y: 10, glyph: 'ו', to: 'Cave_Sod', spawn: { x: 7, y: 5 }, message: 'You enter a cave of sod.' },
    { edge: 'N', to: 'Overworld_Main', spawn: { x: 14, y: 14 }, message: 'You climb back toward the village.' }
  ],
  Cave_Sod: [
    { x: 7, y: 5, glyph: 'ו', to: 'Garden_South', spawn: { x: 5, y: 11 }, message: 'You leave the cave of sod.' }
  ]
};
