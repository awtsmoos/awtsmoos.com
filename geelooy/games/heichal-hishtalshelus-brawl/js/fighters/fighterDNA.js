import { rng, pick } from '../core/random.js';
import { SEFIRAH_NAMES, SEFIROT } from '../data/sefirot.js';
import { WEAPON_IDS } from '../data/weapons.js';
/** B"H — DNA: the hidden scroll from which bones and courage unfold. */
export function createDNA(seed) { const r = rng(seed); const sefirah = pick(r, SEFIRAH_NAMES); const s = SEFIROT[sefirah]; return { seed,sefirah, height:r(.88,1.22), mass:r(.85,1.35), arm:r(.86,1.32), leg:r(.88,1.28), hue:r(25,330), power:r(.85,1.2)*s.power, speed:r(.85,1.25)*s.speed, recovery:r(.85,1.2)*s.recovery, weaponPreference:pick(r,WEAPON_IDS) }; }
