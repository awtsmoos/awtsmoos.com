//B"H
/**
 * @module translationConfig
 * @description Constants for the verse-comment translation river.
 */
import path from 'node:path';

export const ROOT = process.cwd();
export const DB_ROOT = path.resolve(ROOT, '../../dayuhChadash');
export const HEICHEL_ID = 'ikar';
export const TRANSLATION_ALIAS = 'torah_translation_en';
export const TRANSLATION_USER = 'BH_TORAH_TRANSLATION_EN_USER';
export const PROMPT_VERSION = 'tanach-native-refine-v1';
export const TANACH_PATH = 'C:/Users/Yackov Yitzchak/Documents/WoW/BH/torah/Tanach.json';
export const OUT_DIR = path.resolve(ROOT, 'AI_THOUGHTS/2026-06-12_social_system_stress_certification/torah_translation_comments');
export const RUN_DIR = path.join(OUT_DIR, 'parallel_tanach_translation_runs');
export const LOG_PATH = path.join(OUT_DIR, 'parallel_tanach_translation_latest.log');
export const STATE_PATH = path.join(OUT_DIR, 'parallel_tanach_translation_state.json');

export const DIVINE_NAME_POLICY = {
  'יהוה': 'Awtsmoos',
  'יְהֹוָה': 'Awtsmoos',
  'אלהים': 'Elokim',
  'אֱלֹהִים': 'Elokim',
  'אל': 'El',
  'אֵל': 'El',
  'אל שדי': 'El-Shaddai',
  'שדי': 'Shaddai',
  'צבאות': 'Tzevaos',
  'אדני': 'Adonai',
  'אֲדֹנָי': 'Adonai'
};

export const BOOKS = {
  bereishis: { tanachStart: 0, label: 'Bereishis / Genesis' },
  tehillim: { tanachStart: 567, label: 'Tehillim / Psalms' }
};
