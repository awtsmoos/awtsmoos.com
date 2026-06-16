// B"H
/** @file HerdManager.js @description Deer/goat/rabbit social groups with boid-like cohesion. */
import { dataOf, dist, posOf } from './LifeMath.js';
import { setHerd } from './WildlifeMemory.js';
const HERD = new Set(['deer','goat','rabbit']);
export function buildHerds(actors = []) { const groups = {}; actors.forEach(actor => { const s = dataOf(actor).species; if (!HERD.has(s)) return; const id = `${s}_herd_${Math.floor((dataOf(actor).motion && dataOf(actor).motion.seed || 0) / 5)}`; if (!groups[id]) groups[id] = { id, species:s, members:[], leader:null }; groups[id].members.push(actor); setHerd(actor, id); }); Object.values(groups).forEach(g => { g.leader = g.members[0] || null; }); return groups; }
export function herdDecision(actor, groups) { const herdId = dataOf(actor).memory && dataOf(actor).memory.herd, group = groups && groups[herdId]; if (!group || group.members.length < 2) return null; const leader = group.leader; if (leader && leader !== actor && dist(posOf(actor), posOf(leader)) > 9) return { state:'followHerd', target:posOf(leader) }; let cx = 0, cz = 0; group.members.forEach(m => { const p = posOf(m); cx += p.x; cz += p.z; }); cx /= group.members.length; cz /= group.members.length; if (dist(posOf(actor), { x:cx, z:cz }) > 12) return { state:'cohereHerd', target:{ x:cx, z:cz } }; return null; }
export function herdSummary(groups = {}) { const list = Object.values(groups); return { herds:list.length, herdAnimals:list.reduce((a,g)=>a+g.members.length,0) }; }
