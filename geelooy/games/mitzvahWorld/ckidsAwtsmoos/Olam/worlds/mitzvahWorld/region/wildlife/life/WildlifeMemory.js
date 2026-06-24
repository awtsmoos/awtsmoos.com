// B"H
/** @file WildlifeMemory.js @description Animals remember threat, food, water, den, herd, injury, and player history. */
import { dataOf, posOf } from './LifeMath.js';
function ensure(actor){ const d=dataOf(actor); d.memory ||= { threats:[], food:[], water:[], tracks:[], injuries:[], player:[], den:null, herd:null, family:[] }; return d.memory; }
function push(list,item,limit){ list.unshift({ at:Date.now(), ...item }); while(list.length>limit) list.pop(); }
export function memoryOf(actor){ return ensure(actor); }
export function rememberThreat(actor, source, danger=1){ const m=ensure(actor); push(m.threats,{ pos:posOf(source), species:dataOf(source).species||'unknown', danger },12); return m; }
export function rememberFood(actor,pos,kind='food'){ const m=ensure(actor); push(m.food,{ pos, kind },10); return m; }
export function rememberWater(actor,pos){ const m=ensure(actor); push(m.water,{ pos },8); return m; }
export function rememberTrack(actor,track){ const m=ensure(actor); push(m.tracks,track,20); return m; }
export function rememberInjury(actor,source,amount=1){ const m=ensure(actor); push(m.injuries,{ pos:posOf(source), amount },10); return m; }
export function rememberPlayer(actor,action,reputation=0){ const m=ensure(actor); push(m.player,{ action,reputation },12); return m; }
export function setDen(actor,den){ const m=ensure(actor); m.den=den; return m; }
export function setHerd(actor,herdId){ const m=ensure(actor); m.herd=herdId; return m; }
export function recentThreat(actor){ return ensure(actor).threats[0] || null; }
export default { memoryOf, rememberThreat, rememberFood, rememberWater, rememberTrack, rememberInjury, rememberPlayer, setDen, setHerd, recentThreat };
