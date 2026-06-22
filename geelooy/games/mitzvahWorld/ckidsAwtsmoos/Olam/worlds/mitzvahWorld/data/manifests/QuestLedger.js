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
  },
  book_of_moves: {
    title: 'The Book of Moves',
    description: 'Learn real shlichus moves from seforim and bind them to Q/E combat.',
    steps: [
      { id: 'open_moves_book', type: 'book', target: 'shlichus_moves_book' },
      { id: 'learn_mitzvah_spark', type: 'skill', target: 'mitzvah_spark' },
      { id: 'practice_chesed_guard', type: 'combat_practice', target: 'training_yetzer' },
      { id: 'equip_quickbar', type: 'ability_slot', target: 'Q_E_slots' }
    ],
    rewards: { spiritualExperience: 160, skills: ['mitzvah_spark', 'chesed_guard'], unlocks: ['move_combo_training'] }
  },
  road_passage_training: {
    title: 'Road Passages of the Village',
    description: 'Use yellow road passages to chain travel, fights, and missions.',
    steps: [
      { id: 'discover_crossroads', type: 'zone', target: 'village_crossroads' },
      { id: 'fight_on_road', type: 'combat', target: 'road_yetzer_band' },
      { id: 'unlock_passage', type: 'travel', target: 'orchard_lane_passage' }
    ],
    rewards: { spiritualExperience: 140, unlocks: ['road_dash', 'fast_travel_crossroads'] }
  },
  animal_care_and_guardians: {
    title: 'Animal Care and Guardians',
    description: 'Help the living animals, protect them from fox attacks, and earn trust.',
    steps: [
      { id: 'feed_goat', type: 'wildlife', target: 'goat' },
      { id: 'protect_rabbit', type: 'combat', target: 'fox' },
      { id: 'return_lost_cow', type: 'escort', target: 'cow' }
    ],
    rewards: { villageReputation: 2, skills: ['tehillim_courage'], unlocks: ['animal_companion_whistle'] }
  },
  cinematic_shlichus_story: {
    title: 'Generate the Shlichus Movie',
    description: 'Turn missions, dialogue, and learning into playable cutscenes.',
    steps: [
      { id: 'choose_scene', type: 'movie', target: 'movie_generator' },
      { id: 'preview_cutscene', type: 'cutscene', target: 'arrival_opening' },
      { id: 'save_episode', type: 'story_book', target: 'episode_001_arrival' }
    ],
    rewards: { spiritualExperience: 120, unlocks: ['movie_scene_generator', 'story_book_editor'] }
  }
};
