// B"H
/**
 * FactionRewardRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { getFaction } from './FactionRegistry.js';
export function unlockedFactionRewards(factionId='village',rep=0){ const f=getFaction(factionId); return f.rewards.filter((_,i)=>rep>=f.levels[i]); }
export default { unlockedFactionRewards };
