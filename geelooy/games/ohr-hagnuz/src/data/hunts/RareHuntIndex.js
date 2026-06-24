/** B"H @module RareHuntIndex - repeatable rare/boss hunt definitions. */
export const RareHuntIndex = {
  hidden_dragon: { name: 'Hidden Dragon of Gaavah', region: 'Hidden Path', rarity: 'legendary', phases: ['pride', 'fire', 'humility'], reward: 'DRAGON_SCALE', reputation: 'hidden_path' },
  night_scorpion: { name: 'Night Scorpion', region: 'Desert Gate', rarity: 'rare', phases: ['sting', 'judgment'], reward: 'SCORPION_STINGER', reputation: 'orchard_keepers' }
};
export const allRareHunts = () => Object.entries(RareHuntIndex).map(([id, hunt]) => ({ id, ...hunt }));
