// B"H
/** Torah, sefer, and skill seed data for the first learning loop. */
export const LEVEL_ONE_TORAH_SKILLS = Object.freeze({
  alef_focus: { title: 'Alef Focus', xp: 0, unlocks: ['read_siddur_page'] },
  chumash_reader: { title: 'Chumash Reader', xp: 0, unlocks: ['open_bereishis_debate'] },
  chesed_memory: { title: 'Chesed Memory', xp: 0, unlocks: ['community_bonus'] }
});

export const LEVEL_ONE_SEFORIM = Object.freeze({
  siddur_basic: { title: 'Village Siddur', slot: 'book', teaches: 'alef_focus' },
  chumash_bereishis: { title: 'Chumash Bereishis', slot: 'book', teaches: 'chumash_reader' }
});

export const LEVEL_ONE_LEARNING_PROMPTS = Object.freeze({
  first_sefer_ask: ['Read the siddur page', 'Ask the Melamed', 'Put it in inventory']
});
