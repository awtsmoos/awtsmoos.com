//B"H
import { SETTINGS } from './config/settings.js';
import { SPRITES } from './config/sprites.js';
import { COLORS } from './config/colors.js';
import { WORLDS } from './data/worlds.js';
import { SEFIROT, TRAITS } from './data/sefirot.js';
import { SPELLS } from './data/spells.js';
import { HEBREW_LETTERS } from './data/hebrew.js';
import { SOUNDS, SCALES } from './core/audio_data.js';

export const WEAPONS = {
    YOD: { name: 'POINT', speed: 25, damage: 1, spread: 0, char: 'י' },
    HEY: { name: 'BREATH', speed: 10, damage: 2, spread: 0.5, char: 'ה' },
    VAV: { name: 'SPEAR', speed: 40, damage: 0.5, spread: 0, char: 'ו' },
    MENORAH: { name: 'MENORAH', speed: 0, damage: 0.2, spread: 0, char: 'ש' } // Special
};

export const CONFIG = SETTINGS;
export { SPRITES, COLORS, WORLDS, SEFIROT, TRAITS, SPELLS, HEBREW_LETTERS, SOUNDS, SCALES };
