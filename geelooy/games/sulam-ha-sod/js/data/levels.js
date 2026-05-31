// B"H
/**
 * Campaign index for Sulam HaSod.
 *
 * Chapter 4: The Awtsmoos held the ladder while gates five through nine were
 * remade into honest chambers. Gates 1-9 now keep their human-authored shapes
 * without the enrichment fire adding extra cruelty; from gate 10 onward the old
 * storm may still roar.
 */
import { enrichLevel } from './levelCruelty.js';
import { level01 } from './levels/level01-malchus.js';
import { level02 } from './levels/level02-yesod.js';
import { level03 } from './levels/level03-hod.js';
import { level04 } from './levels/level04-netzach.js';
import { level05 } from './levels/level05-gevurah.js';
import { level06 } from './levels/level06-tiferes.js';
import { level07 } from './levels/level07-chesed.js';
import { level08 } from './levels/level08-binah.js';
import { level09 } from './levels/level09-chochmah.js';
import { level10 } from './levels/level10-keter.js';
import { level11 } from './levels/level11-daas.js';
import { level12 } from './levels/level12-ayin.js';
import { level13 } from './levels/level13-atika.js';
import { level14 } from './levels/level14-einsof.js';
import { level15 } from './levels/level15-razor-ayin.js';
import { level16 } from './levels/level16-trust-breaker.js';
import { level17 } from './levels/level17-bait-vault.js';
import { level18 } from './levels/level18-no-autopilot.js';
import { level19 } from './levels/level19-hidden-manna.js';
import { level20 } from './levels/level20-crown-of-return.js';
import { level21 } from './levels/level21-shattered-ledger.js';
import { level22 } from './levels/level22-mirror-market.js';
import { level23 } from './levels/level23-vertical-vault.js';
import { level24 } from './levels/level24-crown-auction.js';
import { level25 } from './levels/level25-natural-chain.js';
import { level26 } from './levels/level26-natural-chain.js';
import { level27 } from './levels/level27-natural-chain.js';
import { level28 } from './levels/level28-natural-chain.js';
import { level29 } from './levels/level29-natural-chain.js';
import { level30 } from './levels/level30-sky-oath.js';
import { level31 } from './levels/level31-echo-orchard.js';
import { level32 } from './levels/level32-cave-of-breath.js';
import { level33 } from './levels/level33-last-ladder.js';
import { level34 } from './levels/level34-thorn-contract.js';
import { level35 } from './levels/level35-mirror-abattoir.js';
import { level36 } from './levels/level36-sky-tax-court.js';
import { level37 } from './levels/level37-saw-mikveh.js';
import { level38 } from './levels/level38-crown-of-teeth.js';
import { level39 } from './levels/level39-abyss-ledger.js';
import { level40 } from './levels/level40-iron-echo-court.js';
import { level41 } from './levels/level41-glass-sitra.js';
import { level42 } from './levels/level42-snow-knife-parliament.js';
import { level43 } from './levels/level43-thunder-shekel-mine.js';
import { level44 } from './levels/level44-last-tooth-of-atzilus.js';
import { level45 } from './levels/level45-blue-fire-beis-din.js';
import { level46 } from './levels/level46-bone-rain-covenant.js';
import { level47 } from './levels/level47-river-of-latches.js';
import { level48 } from './levels/level48-cinder-shofar-vault.js';
import { level49 } from './levels/level49-ash-mazal-gear.js';
import { level50 } from './levels/level50-emerald-noose-garden.js';
import { level51 } from './levels/level51-black-rainbow-gate.js';

const RAW_LEVELS = [
  level01, level02, level03, level04, level05, level06, level07, level08, level09,
  level10, level11, level12, level13, level14, level15, level16, level17,
  level18, level19, level20, level21, level22, level23, level24, level25,
  level26, level27, level28, level29, level30, level31, level32, level33,
  level34, level35, level36, level37, level38, level39, level40, level41,
  level42, level43, level44, level45, level46, level47, level48, level49,
  level50, level51
];

const HUMAN_AUTHORED_CLEAR_GATES = 9;
const clone = value => structuredClone(value);

/** @param {object} level Raw authored level. @returns {object} Safe copied level. */
function keepHumanGate(level) { return clone(level); }

/** @param {object} level Raw authored level. @param {number} index Zero-based campaign index. @returns {object} Playable campaign level. */
function revealPlayableGate(level, index) {
  return index < HUMAN_AUTHORED_CLEAR_GATES ? keepHumanGate(level) : enrichLevel(level, index);
}

/** @constant {Array<object>} LEVELS */
export const LEVELS = RAW_LEVELS.map(revealPlayableGate);
