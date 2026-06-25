// B"H
/** SocialRuntime: reputation, family, rumors, pilgrims, genealogy, virtue. */
import { appendFeature49Log, mutateFeature49State } from './Feature49State.js';
const VIRTUES = ['honesty','generosity','wisdom','diligence','humility'];
export function changeVirtue(npcId='village', virtue='generosity', amount=1){ return mutateFeature49State(s=>{ s.virtues ||= {}; s.virtues[npcId] ||= Object.fromEntries(VIRTUES.map(v=>[v,0])); s.virtues[npcId][virtue]=(s.virtues[npcId][virtue]||0)+amount; appendFeature49Log({type:'virtue',npcId,virtue,amount}); return s; }); }
export function rememberNpc(npcId, event){ return mutateFeature49State(s=>{ s.npcMemory ||= {}; (s.npcMemory[npcId] ||= []).push({...event,at:Date.now()}); s.npcMemory[npcId]=s.npcMemory[npcId].slice(-24); return s; }); }
export function spreadRumor(text, source='player'){ return mutateFeature49State(s=>{ s.rumors ||= []; s.rumors.unshift({text,source,heat:1,at:Date.now()}); s.rumors=s.rumors.slice(0,40); return s; }); }
export function relateFamily(a,b,kind='kin'){ return mutateFeature49State(s=>{ s.family ||= {}; (s.family[a] ||= {})[b]=kind; (s.family[b] ||= {})[a]=kind; return s; }); }
export function addPilgrim(origin='distant_settlement', story='A traveler brings a quiet story.'){ return mutateFeature49State(s=>{ s.pilgrims ||= []; s.pilgrims.push({origin,story,arrivedAt:Date.now()}); s.pilgrims=s.pilgrims.slice(-20); return s; }); }
export function recordGeneration(family='village', person='child'){ return mutateFeature49State(s=>{ s.genealogy ||= {}; (s.genealogy[family] ||= []).push({person,bornAt:Date.now()}); return s; }); }
export function socialSnapshot(state={}){ return { virtues:state.virtues||{}, rumors:state.rumors||[], pilgrims:state.pilgrims||[], genealogy:state.genealogy||{} }; }
export default { changeVirtue, rememberNpc, spreadRumor, relateFamily, addPilgrim, recordGeneration, socialSnapshot };
