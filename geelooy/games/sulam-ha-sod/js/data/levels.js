// B"H
/**
 * Campaign index for Sulam HaSod.
 *
 * No generated overlay lives here. Every cruelty remains inspectable and rooted
 * in authored geometry. The Awtsmoos now raises thirty-three explicit chambers,
 * then grafts high-sky side-thoughts onto each one: optional ascents, rotating
 * saw ladders, fake-safe spikes, collapsing greed corridors, and falling iron.
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

const RAW_LEVELS = [
  level01, level02, level03, level04, level05, level06, level07, level08,
  level09, level10, level11, level12, level13, level14, level15, level16,
  level17, level18, level19, level20, level21, level22, level23, level24,
  level25, level26, level27, level28, level29, level30, level31, level32,
  level33
];

/**
 * Every level receives optional side adventures and reactive cruelty.
 *
 * The main routes stay solvable. The extra upper chambers tempt the player into
 * voluntary danger with better treasure, moving saw bridges, false-safe spike
 * runs, and trigger-driven ceiling traps.
 */
export const LEVELS = RAW_LEVELS.map((level, index) => enrichLevel(level, index));
