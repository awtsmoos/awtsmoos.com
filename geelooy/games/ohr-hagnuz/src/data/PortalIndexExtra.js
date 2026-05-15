/**
 * B"H
 * @module PortalIndexExtra
 * Extra region links. Loaded before base portals so these can override broad edges.
 */
export const ExtraPortals = {
  Forest_East: [
    { edge: 'E', to: 'River_East', spawn: { x: 1, y: 5 }, message: 'The wild road reaches the riverlands.' }
  ],
  River_East: [
    { edge: 'W', to: 'Forest_East', spawn: { x: 26, y: 6 }, message: 'You return to the eastern forest.' },
    { edge: 'E', to: 'Market_West', spawn: { x: 1, y: 6 }, message: 'The road opens into the market of letters.' },
    { edge: 'N', to: 'Academy_Upper', spawn: { x: 10, y: 6 }, message: 'You climb toward the upper academy.' },
    { edge: 'S', to: 'Ruins_Lower', spawn: { x: 14, y: 1 }, message: 'You descend toward lower ruins.' }
  ],
  Market_West: [
    { edge: 'W', to: 'River_East', spawn: { x: 26, y: 5 }, message: 'You leave the market for the river road.' },
    { edge: 'E', to: 'Orchard_Deep', spawn: { x: 1, y: 5 }, message: 'The market road becomes a deep orchard.' },
    { edge: 'S', to: 'Garden_South', spawn: { x: 14, y: 1 }, message: 'You descend into the southern garden.' }
  ],
  Orchard_Deep: [
    { edge: 'W', to: 'Market_West', spawn: { x: 26, y: 6 }, message: 'You return to the market of letters.' },
    { edge: 'N', to: 'Garden_South', spawn: { x: 14, y: 11 }, message: 'You climb back into the garden.' },
    { edge: 'S', to: 'Ruins_Lower', spawn: { x: 14, y: 1 }, message: 'The orchard sinks toward old ruins.' }
  ],
  Academy_Upper: [
    { x: 8, y: 6, glyph: 'ח', to: 'River_East', spawn: { x: 14, y: 1 }, message: 'You descend from the academy to the river.' }
  ],
  Ruins_Lower: [
    { edge: 'N', to: 'River_East', spawn: { x: 14, y: 8 }, message: 'You return to the river from the ruins.' },
    { edge: 'E', to: 'Cave_Sod', spawn: { x: 7, y: 5 }, message: 'A ruined passage opens into the cave of sod.' }
  ],
  Garden_South: [
    { edge: 'S', to: 'Orchard_Deep', spawn: { x: 14, y: 1 }, message: 'The garden expands into a deeper orchard.' }
  ]
};
