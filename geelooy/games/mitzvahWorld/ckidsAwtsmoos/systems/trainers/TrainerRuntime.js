// B"H
/**
 * Trainers grant identity abilities, ranked Torah passages, and tutorial
 * direction. A starter path may speak in fantasy names, but the trainer anchors
 * it into a real passage in the spellbook and action bar.
 */
import { trainerForPath, TRAINERS } from './TrainerRegistry.js';
import { AbilityIndex, abilityRankInfo } from '../../tochen/torah/AbilityIndex.js';
import { learnPassage } from '../torah/TorahSpellbookRuntime.js';
import { assignActionSlot } from '../torah/TorahActionBarState.js';
const COST_BASE = 6;
const PATH_PASSAGE = Object.freeze({ learner:'shemaUnity', helper:'tehillimSong', guardian:'amidahArrow', builder:'chumashLight' });
function playerOf(olam){ return olam?.player || olam?.chossid || null; }
function emit(olam,name,payload){ olam?.ayshPeula?.('ui event',name,payload); }
function stateOf(target={}){ const p=playerOf(target) || target; p.trainerState ||= { abilityRanks:{}, trainedAt:[], learnedAbilities:[] }; return p.trainerState; }
function levelOf(olam){ return Math.max(1,Number(playerOf(olam)?.level || olam?.level || 1)); }
function perutahOf(olam){ return Number(playerOf(olam)?.perutah ?? olam?.perutah ?? 0); }
function setPerutah(olam,value){ const p=playerOf(olam) || olam; if(p) p.perutah=Math.max(0,Number(value||0)); }
function passageIdForTrainer(trainer){ return AbilityIndex[trainer?.ability] ? trainer.ability : (PATH_PASSAGE[trainer?.path] || 'shemaUnity'); }
function costForRank(rank){ return COST_BASE + Math.max(0,rank-1)*8; }
export function ensureTrainerState(target={}){ return stateOf(target); }
export function trainerOffers(olamOrPath='learner'){
  const olam=typeof olamOrPath==='object'?olamOrPath:null, path=typeof olamOrPath==='string'?olamOrPath:'learner';
  const state=stateOf(olam||{}), lvl=olam?levelOf(olam):1, coins=olam?perutahOf(olam):Infinity;
  return TRAINERS.map(t=>{ const passageId=passageIdForTrainer(t), ability=AbilityIndex[passageId], info=abilityRankInfo(passageId), current=state.abilityRanks[passageId]||0, next=current+1, max=info.max||1, required=info.unlockLevel + Math.max(0,next-1), cost=costForRank(next); return { ...t, selected:t.path===path, pathAbility:t.ability, passageId, ability:passageId, abilityName:ability?.name||passageId, currentRank:current, nextRank:Math.min(next,max), maxRank:max, requiredLevel:required, cost, trainable:next<=max && lvl>=required && coins>=cost, reason:next>max?'max-rank':lvl<required?'level-required':coins<cost?'low-perutah':'ready' }; });
}
export function trainerPayload(path='learner'){ const selected=trainerForPath(typeof path==='string'?path:'learner'); return { trainer:selected, choices:trainerOffers(path) }; }
export function rankedPassage(olamOrTopic='kindness', passage=null){ if(typeof olamOrTopic==='string') return { topic:olamOrTopic, rank:1, text:'A small steady mitzvah is stronger than a loud empty motion.' }; const olam=olamOrTopic, move=passage||{}; const rank=stateOf(olam).abilityRanks[move.id]||1, info=abilityRankInfo(move.id); const damage=Math.round(Number(move.damage||0)*(1+(rank-1)*(info.damageStep||0))); const cost=Math.max(0,Math.round(Number(move.cost||0)*(1+(rank-1)*(info.costStep||0)))); return { ...move, rank, damage, cost }; }
export function trainAbilityAtTrainer(olam, path='learner', options={}){
  const p=playerOf(olam); if(!p) return { ok:false, error:'missing-player' };
  const trainer=trainerForPath(path), offer=trainerOffers(olam).find(o=>o.path===trainer.path); if(!offer) return { ok:false, error:'missing-trainer' };
  if(!offer.trainable && !options.free) return { ok:false, error:offer.reason, offer };
  const state=stateOf(olam); if(!options.free) setPerutah(olam,perutahOf(olam)-offer.cost);
  state.abilityRanks[offer.passageId]=offer.nextRank; if(!state.learnedAbilities.includes(offer.passageId)) state.learnedAbilities.push(offer.passageId);
  state.trainedAt.push({ ability:offer.passageId, pathAbility:offer.pathAbility, rank:offer.nextRank, trainerId:trainer.id, at:Date.now(), cost:options.free?0:offer.cost }); state.trainedAt=state.trainedAt.slice(-40);
  const move=learnPassage(olam,offer.passageId,{ silent:options.silent }); if(move && offer.nextRank===1) assignActionSlot(olam,options.slot||1,{ type:'passage', passageId:offer.passageId });
  const payload={ ok:true, trainer, offer:{...offer, currentRank:offer.nextRank}, move, perutah:perutahOf(olam), trainerState:state };
  emit(olam,'trainer',payload); emit(olam,'effectsOverlay',{ text:`TRAINED ${offer.abilityName} R${offer.nextRank}`, color:'#d7c8ff' }); return payload;
}
export function createTrainerRuntime(store={}){ const state=stateOf(store); return { train(path='learner'){ const t=trainerForPath(path), passageId=passageIdForTrainer(t); if(!state.learnedAbilities.includes(passageId)) state.learnedAbilities.push(passageId); state.abilityRanks[passageId]=Math.max(1,state.abilityRanks[passageId]||1); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:trained',{detail:{trainer:t,learned:state.learnedAbilities}})); return { ...t, passageId }; }, trainOlam:trainAbilityAtTrainer, known(){return state.learnedAbilities.slice();}, offers:trainerOffers, payload:trainerPayload }; }
export default createTrainerRuntime;
