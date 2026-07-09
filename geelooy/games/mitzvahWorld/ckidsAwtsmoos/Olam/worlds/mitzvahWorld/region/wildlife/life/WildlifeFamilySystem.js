// B"H
/** @file WildlifeFamilySystem.js @description Parents, babies, mates, and follow behavior. */
import { dataOf, dist, posOf, steerAway } from './LifeMath.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { memoryOf } from './WildlifeMemory.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
const BABIES = Object.freeze({ rabbit:'kit', deer:'fawn', goat:'kid', fox:'kit', bird:'chick', frog:'tadpole' });
export function seedFamilies(actors = []) { const bySpecies = {}; actors.forEach(a => { const s = dataOf(a).species || 'rabbit'; if (!bySpecies[s]) bySpecies[s] = []; bySpecies[s].push(a); }); let babies = 0; for (const species of Object.keys(bySpecies)) { const list = bySpecies[species]; for (let i = 1; i < list.length; i += 5) { const parent = list[i - 1], child = list[i]; memoryOf(child).parent = parent; memoryOf(parent).children.push(child); dataOf(child).lifeStage = BABIES[species] || 'young'; dataOf(child).scaleHint = .62; babies++; } } return { families:Object.keys(bySpecies).length, babies }; }
export function familyTarget(actor) { const m = memoryOf(actor); if (m.parent) return posOf(m.parent); if (m.children && m.children.length) { const far = m.children.find(c => dist(posOf(actor), posOf(c)) > 7); if (far) return posOf(far); } return null; }
export function familyDecision(actor) { const t = familyTarget(actor); if (!t) return null; if (dist(posOf(actor), t) < 2) return { state:'socialIdle' }; return { state:'followFamily', target:t }; }
export function protectFamily(actor, threat) { if (!threat) return null; const m = memoryOf(actor); if (m.children && m.children.length) return { state:'protectYoung', target:steerAway(posOf(actor), posOf(threat.actor || threat), 12) }; return null; }
