// B"H
/** NPC density: the village greets the player before systems speak. */
export const LEVEL_ONE_NPCS = Object.freeze([
  {
    id: 'village_rebbe',
    type: 'npcChossid',
    position: [-4, 0, -9],
    props: { displayName: 'The Village Rebbe', role: 'first_quest_giver', shlichusId: 'first_siddur_pages' }
  },
  { id: 'market_shliach', type: 'npcChossid', position: [16, 0, -17], props: { displayName: 'Market Shliach', role: 'vendor_hint' } },
  { id: 'school_melamed', type: 'npcChossid', position: [-17, 0, -29], props: { displayName: 'Melamed', role: 'learning_hint' } },
  { id: 'kindness_villager', type: 'npcChossid', position: [7, 0, -8], props: { displayName: 'A Grateful Villager', role: 'community_hint' } }
]);
