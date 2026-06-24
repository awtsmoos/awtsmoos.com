/** B"H @module FactionIndex - region/faction standing. */
export const FactionIndex = {
  orchard_keepers: { name: 'Orchard Keepers', region: 'Orchard of Seven Species' },
  scribes: { name: 'Scribes of Memory', region: 'House of Learning' },
  hidden_path: { name: 'Hidden Path Watchers', region: 'Hidden Path' }
};
export const rankForStanding = value => value >= 100 ? 'revered' : value >= 50 ? 'honored' : value >= 20 ? 'known' : 'stranger';
