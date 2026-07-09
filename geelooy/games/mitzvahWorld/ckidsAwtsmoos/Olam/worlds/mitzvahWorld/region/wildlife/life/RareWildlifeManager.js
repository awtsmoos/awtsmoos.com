// B"H
/** @file RareWildlifeManager.js @description Albino rabbit, golden fox, great stag, ancient eagle. */
import { dataOf, hash } from './LifeMath.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
const RARE = Object.freeze({ rabbit:'albinoRabbit', fox:'goldenFox', deer:'greatStag', bird:'ancientEagle', goat:'silverGoat', frog:'emeraldFrog' });
export function markRareWildlife(actors = []) { let rares = 0; actors.forEach((actor, i) => { const data = dataOf(actor), species = data.species || 'rabbit'; if (data.rareWildlife) return; const roll = hash(i, species.length, 99); if (roll < .035) { data.rareWildlife = RARE[species] || 'rareCreature'; data.rewardMultiplier = 4; data.health.max *= 1.8; data.health.current = data.health.max; rares++; } }); return rares; }
export function rareDecision(actor) { const data = dataOf(actor); if (!data.rareWildlife) return null; if (data.species === 'bird') return { state:'legendarySoar' }; if (data.species === 'deer') return { state:'majesticHerd' }; return null; }
export function rareSummary(actors = []) { const rares = actors.filter(a => dataOf(a).rareWildlife); return { rareWildlife:rares.length, kinds:rares.map(a => dataOf(a).rareWildlife).slice(0, 10) }; }
