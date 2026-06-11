import { createDNA } from './fighterDNA.js';
import { statsFromDNA } from './fighterStats.js';
import { baseFighterState } from './fighterState.js';
import { buildSkeleton } from '../skeleton/buildSkeleton.js';
/** B"H — creates one generated warrior, bones first, glory later. */
export function createFighter(seed, x, y, human=false) { const dna=createDNA(seed); const f=baseFighterState(seed,x,y,human,dna,statsFromDNA(dna)); f.bones=buildSkeleton(f); return f; }
