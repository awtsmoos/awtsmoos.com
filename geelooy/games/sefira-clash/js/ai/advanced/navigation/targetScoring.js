import { wallSense } from '../../sense/wallSense.js';
import { revengeTargetBonus } from '../emotion/revengeMemory.js';
import { rivalryTargetBonus } from '../strategy/rivalrySystem.js';
import { findPlatformRoute } from './routeSearch.js';

/** B"H - Target scoring with rivalry, hunt pressure, and less local camping. */
export function targetScore(bot,target,map,graph,botNode,targetNode,urgent){
 const dx=Math.abs(target.x-bot.x), dy=Math.abs(target.y-bot.y), heat=bot.aiMind?.combatHeat||{}, boredom=Math.min(2,(heat.noDamageFrames||0)/300);
 const blocked=wallSense(bot,target,map).blocked?260:0, routePenalty=routeCost(graph,botNode.id,targetNode.id,urgent||boredom>0.7);
 const same=botNode.id===targetNode.id?Math.max(20,130-boredom*90):0, damage=Math.min(240,target.damage||0);
 const human=target.human&&dx<2600?85:0, rival=rivalryTargetBonus(bot,target), weak=target.stocks<=1?50:0;
 const farHunt=boredom*Math.max(0,620-Math.abs(dx-760)*0.25), charge=charging(target)?105:0;
 return dx*(urgent?0.55:0.78)+dy*0.38+blocked+routePenalty-same-damage-revengeTargetBonus(bot,target)-rival-human-weak-farHunt-charge;
}
function routeCost(graph,fromId,toId,urgent){if(fromId===toId)return-55; const r=findPlatformRoute(graph,fromId,toId); if(!r.found)return urgent?260:480; return Math.max(0,(r.nodes?.length||1)-1)*(urgent?32:55);}
function charging(t){return Math.max(t.charge?.punch||0,t.charge?.kick||0,(t.chargeGlow||0)*90)>14;}
