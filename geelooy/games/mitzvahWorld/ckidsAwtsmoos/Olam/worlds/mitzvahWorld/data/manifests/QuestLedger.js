/** B"H — QuestLedger.js: first five minutes become a chain. */
export const QUEST_LEDGER = {
  first_steps: {
    title: 'First Steps in the Village',
    description: 'Connect with the community and find your place.',
    steps: [
      { id: 'greet_rebbe', type: 'dialogue', target: 'village_rebbe', status: 'PENDING' },
      { id: 'enter_sanctuary', type: 'trigger', target: 'main_beis_midrash', status: 'LOCKED' }
    ],
    rewards: { spiritualExperience: 100, items: ['siddur_basic'] }
  },
  first_siddur_pages: {
    title: 'Gather the Siddur Pages',
    description: 'Collect three scattered pages and return to the Rebbe.',
    steps: [
      { id: 'collect_pages', type: 'collect', target: 'siddur_page', count: 3 },
      { id: 'return_rebbe', type: 'dialogue', target: 'village_rebbe' }
    ],
    rewards: { spiritualExperience: 120, items: ['siddur_basic'], unlocks: ['first_sefer_study'] }
  },
  first_sefer_study: {
    title: 'Open the Chumash',
    description: 'Pick up a sefer and unlock your first Torah learning skill.',
    steps: [
      { id: 'pickup_chumash', type: 'inventory', target: 'chumash_bereishis' },
      { id: 'learn_skill', type: 'skill', target: 'chumash_reader' }
    ],
    rewards: { spiritualExperience: 80, skills: ['chumash_reader'] }
  },
  first_village_market: {
    title: 'Buy, Sell, and Wear',
    description: 'Sell a village good and try your first clothing switch.',
    steps: [
      { id: 'sell_good', type: 'merchant', target: 'market_shliach' },
      { id: 'switch_clothing', type: 'clothing', target: 'blue_bekeshe' }
    ],
    rewards: { coins: 5, items: ['blue_bekeshe'] }
  },
  first_farm_and_animal: {
    title: 'Field and Flock',
    description: 'Harvest wheat, gather wool, and learn how goods become community growth.',
    steps: [
      { id: 'harvest_wheat', type: 'farm', target: 'village_wheat_patch' },
      { id: 'gather_wool', type: 'loot', target: 'village_sheep' }
    ],
    rewards: { items: ['wheat_sheaf', 'wool_bundle'], villageReputation: 1 }
  }
};
