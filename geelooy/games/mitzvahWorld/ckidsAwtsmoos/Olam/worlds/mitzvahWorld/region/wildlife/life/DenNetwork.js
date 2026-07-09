// B"H
/** @file DenNetwork.js @description Fox dens, rabbit burrows, nests, frog ponds, and rest homes. */
import { around, dataOf, hash, posOf } from './LifeMath.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { setDen } from './WildlifeMemory.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
const KIND = Object.freeze({ fox:'foxDen', rabbit:'burrow', deer:'groveBed', goat:'cliffNook', frog:'pondEdge', bird:'nest' });
export function createDenFor(actor, index = 0) { const data = dataOf(actor), species = data.species || 'rabbit', p = posOf(actor), spot = around(p, species === 'bird' ? 18 : 8, index + hash(p.x, p.z)); const den = { id:`${species}_home_${index}`, species, kind:KIND[species] || 'den', x:spot.x, z:spot.z, capacity:species === 'rabbit' ? 6 : species === 'bird' ? 4 : 2, occupants:[] }; setDen(actor, den); return den; }
export function ensureDens(actors = []) { const dens = []; actors.forEach((actor, i) => { const memory = dataOf(actor).memory || {}; if (!memory.den) dens.push(createDenFor(actor, i)); else dens.push(memory.den); }); return dens; }
export function denTarget(actor) { const memory = dataOf(actor).memory || {}; return memory.den || createDenFor(actor, dataOf(actor).motion && dataOf(actor).motion.seed || 1); }
export function denSummary(dens = []) { const byKind = {}; dens.forEach(d => { byKind[d.kind] = (byKind[d.kind] || 0) + 1; }); return { dens:dens.length, byKind }; }
