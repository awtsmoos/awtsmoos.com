// B"H
<<<<<<< HEAD
/**
 * QuestGossipRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { STARTER_MISSIONS } from './MissionRegistry.js';
const FIRST_SHLIACH = Object.freeze({ id:"the_first_shliach", chain:"starter", giver:"rebbe", title:"The First Shliach", story:"Begin in the village: speak to the Rebbe, find his house, and help guard the path.", objectives:[{ id:"talk_rebbe", text:"Talk to the Rebbe", count:1 },{ id:"discover_rebbe_house", text:"Discover the Rebbe house", count:1 }], rewards:{ xp:45, perutah:8, items:["starter_pack"] } });
function mission(id){ return STARTER_MISSIONS.find(m=>m.id===id) || (id===FIRST_SHLIACH.id ? FIRST_SHLIACH : FIRST_SHLIACH); }
function state(olam){ olam.__activeMissions ||= {}; olam.__completedMissions ||= {}; return olam; }
export function questChoicesForNpc(npcId,completed=[]){ return STARTER_MISSIONS.filter(m=>(m.giver===npcId)&&!completed.includes(m.id)).map(m=>({id:m.id,label:m.title})); }
export function questOfferPayload(olam={},id="the_first_shliach"){ const m=mission(id); return { ok:true, id:m.id, missionId:m.id, npcId:m.giver, giverNpc:m.giver, title:m.title, story:m.story||m.missionText||m.title, objectives:m.objectives||[], rewards:m.rewards||{}, state:"offered", buttons:{ accept:true, decline:true } }; }
export function acceptQuest(olam={},id="the_first_shliach"){ const m=mission(id); state(olam).__activeMissions[m.id] ||= { ...m, progress:0, objectiveProgress:{} }; olam.ayshPeula?.("ui event","questAccepted",questOfferPayload(olam,id)); return { ok:true, id:m.id, state:"accepted" }; }
export function progressQuestObjective(olam={},id="the_first_shliach",objectiveId="progress",amount=1){ const m=mission(id), s=state(olam), active=s.__activeMissions[m.id] ||= { ...m, progress:0, objectiveProgress:{} }; active.objectiveProgress[objectiveId]=(active.objectiveProgress[objectiveId]||0)+amount; active.progress=Object.values(active.objectiveProgress).reduce((a,b)=>a+Number(b||0),0); olam.ayshPeula?.("ui event","questProgress",{ id:m.id, objectiveId, progress:active.objectiveProgress[objectiveId], complete:active.progress >= (m.objectives?.length || 1) }); return { ok:true, id:m.id, objectiveId, progress:active.objectiveProgress[objectiveId] }; }
export function turnInQuest(olam={},id="the_first_shliach"){ const m=mission(id), s=state(olam); s.__completedMissions[m.id]=true; delete s.__activeMissions[m.id]; olam.player ||= {}; olam.player.xp=Number(olam.player.xp||0)+Number(m.rewards?.xp||m.rewards?.shlichusXp||0); olam.player.perutah=Number(olam.player.perutah||0)+Number(m.rewards?.perutah||m.rewards?.perutas||0); olam.ayshPeula?.("ui event","questTurnedIn",{ id:m.id, title:m.title, rewards:m.rewards||{} }); return { ok:true, id:m.id, state:"turned-in", rewards:m.rewards||{} }; }
export default { questChoicesForNpc, questOfferPayload, acceptQuest, progressQuestObjective, turnInQuest };
=======
/** Quest gossip: offers, accepts, progress, turn-in; no frame loop. */
import { STARTER_MISSIONS, getMission } from './MissionRegistry.js';
import { createMissionRuntime } from './MissionRuntime.js';
export function questChoicesForNpc(npcId, completed=[]) { return STARTER_MISSIONS.filter(m=>m.giver===npcId&&!completed.includes(m.id)).map(m=>({id:m.id,label:m.title})); }
export function questOfferPayload(npcId, store=globalThis.__MITZVAH_WORLD_STATE__||{}) { return { npcId, offers:questChoicesForNpc(npcId, store.completedMissions||[]) }; }
export function acceptQuest(id, store=globalThis.__MITZVAH_WORLD_STATE__||{}) { return createMissionRuntime(store).accept(id); }
export function progressQuestObjective(id, amount=1, store=globalThis.__MITZVAH_WORLD_STATE__||{}) { return createMissionRuntime(store).progress(id, amount); }
export function turnInQuest(id, store=globalThis.__MITZVAH_WORLD_STATE__||{}) { return createMissionRuntime(store).finish(id); }
export default { questChoicesForNpc, questOfferPayload, acceptQuest, progressQuestObjective, turnInQuest, getMission };
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
