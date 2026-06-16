// B"H
/** @file WildlifeMemory.js @description Animals remember threat, food, water, den, herd, and territory clues. */
import { dataOf, posOf } from './LifeMath.js';
function ensure(actor) { const data = dataOf(actor); if (!data.memory) data.memory = { threats:[], food:[], water:[], tracks:[], den:null, herd:null, mate:null, parent:null, children:[] }; return data.memory; }
function rememberList(list, item, limit) { list.unshift(Object.assign({ at:Date.now() }, item)); while (list.length > limit) list.pop(); }
export function memoryOf(actor) { return ensure(actor); }
export function rememberThreat(actor, source, danger = 1) { const m = ensure(actor); rememberList(m.threats, { pos:posOf(source), species:dataOf(source).species || 'unknown', danger }, 12); return m; }
export function rememberFood(actor, pos, kind = 'food') { const m = ensure(actor); rememberList(m.food, { pos, kind }, 10); return m; }
export function rememberWater(actor, pos) { const m = ensure(actor); rememberList(m.water, { pos }, 8); return m; }
export function rememberTrack(actor, track) { const m = ensure(actor); rememberList(m.tracks, track, 20); return m; }
export function setDen(actor, den) { const m = ensure(actor); m.den = den; return m; }
export function setHerd(actor, herdId) { const m = ensure(actor); m.herd = herdId; return m; }
export function recentThreat(actor) { const m = ensure(actor); return m.threats[0] || null; }
