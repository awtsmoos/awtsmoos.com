// B"H
/** Torah, sefer, and skill seed data for the first learning loop. */
export const LEVEL_ONE_TORAH_SKILLS = Object.freeze({
  alef_focus: { title: 'Alef Focus', xp: 0, unlocks: ['read_siddur_page'] },
  chumash_reader: { title: 'Chumash Reader', xp: 0, unlocks: ['open_bereishis_debate'] },
  chesed_memory: { title: 'Chesed Memory', xp: 0, unlocks: ['community_bonus'] },
  tanya_resolve: { title: 'Tanya Resolve', xp: 0, unlocks: ['yetzer_counter', 'calm_focus_regen'] },
  mishnah_guard: { title: 'Mishnah Guard', xp: 0, unlocks: ['shield_stance', 'precise_parry'] },
  tehillim_courage: { title: 'Tehillim Courage', xp: 0, unlocks: ['team_heal_song', 'fear_break'] },
  gemara_svara: { title: 'Gemara Svara', xp: 0, unlocks: ['argument_combo', 'logic_crit'] }
});

export const LEVEL_ONE_SHLICHUS_MOVES = Object.freeze({
  mitzvah_spark: { title: 'Mitzvah Spark', input: 'Q', role: 'opener', learnsFrom: 'alef_focus', cooldown: 4, effects: ['stun_yetzer', 'light_small_area'] },
  chesed_guard: { title: 'Chesed Guard', input: 'E', role: 'defense', learnsFrom: 'chesed_memory', cooldown: 7, effects: ['shield_self', 'protect_nearby_npc'] },
  niggun_step: { title: 'Niggun Step', input: 'Shift+Q', role: 'movement', learnsFrom: 'tehillim_courage', cooldown: 6, effects: ['dash_forward', 'inspire_allies'] },
  pilpul_combo: { title: 'Pilpul Combo', input: 'Q,Q,E', role: 'combo', learnsFrom: 'gemara_svara', cooldown: 9, effects: ['logic_chain_damage', 'bonus_xp_on_finish'] },
  maamar_focus: { title: 'Maamar Focus', input: 'Hold E', role: 'channel', learnsFrom: 'tanya_resolve', cooldown: 12, effects: ['slow_time_feel', 'restore_focus'] },
  mishnah_parry: { title: 'Mishnah Parry', input: 'Tap E', role: 'counter', learnsFrom: 'mishnah_guard', cooldown: 3, effects: ['perfect_block', 'counter_spark'] }
});

export const LEVEL_ONE_SEFORIM = Object.freeze({
  siddur_basic: { title: 'Village Siddur', slot: 'book', teaches: 'alef_focus' },
  chumash_bereishis: { title: 'Chumash Bereishis', slot: 'book', teaches: 'chumash_reader' },
  tanya_likkutei: { title: 'Tanya: First Maamar', slot: 'book', teaches: 'tanya_resolve' },
  mishnah_berachos: { title: 'Mishnah Berachos', slot: 'book', teaches: 'mishnah_guard' },
  tehillim_pocket: { title: 'Pocket Tehillim', slot: 'book', teaches: 'tehillim_courage' },
  gemara_bava_metzia: { title: 'Gemara Bava Metzia', slot: 'book', teaches: 'gemara_svara' }
});

export const LEVEL_ONE_LEARNING_PROMPTS = Object.freeze({
  first_sefer_ask: ['Read the siddur page', 'Ask the Melamed', 'Put it in inventory'],
  combat_book_ask: ['Practice the move', 'Ask for a mashal', 'Add to quickbar'],
  cutscene_book_ask: ['Generate a scene', 'Preview the camera path', 'Save to the story book']
});
